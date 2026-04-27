package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.entity.EventView;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.exception.custom.EventNotFoundException;
import com.gdje_izlazimo.project.exception.custom.ReservationAccessDeniedException;
import com.gdje_izlazimo.project.exception.custom.VenueNotFoundException;
import com.gdje_izlazimo.project.mapper.EventMapper;
import com.gdje_izlazimo.project.repository.EventRepository;
import com.gdje_izlazimo.project.repository.EventViewRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final EventMapper eventMapper;
    private final ImageKitService imageKitService;
    private final EventViewRepository eventViewRepository;
    private static final int TRENDING_COUNT = 5;
    private static final Duration TRENDING_WINDOW = Duration.ofDays(7);

    public EventService(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            EventMapper eventMapper,
            ImageKitService imageKitService,
            EventViewRepository eventViewRepository
    ) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.eventMapper = eventMapper;
        this.imageKitService = imageKitService;
        this.eventViewRepository = eventViewRepository;
    }

    public List<EventResponse> searchEvents(String query, LocalDateTime dateFrom, LocalDateTime dateTo, Pageable pageable) {
        boolean hasQuery = query != null && !query.isBlank();
        List<Event> events = hasQuery
                ? eventRepository.searchByQuery(query, dateFrom, dateTo, pageable).getContent()
                : eventRepository.findAllFiltered(dateFrom, dateTo, pageable).getContent();
        return enrichWithStats(events);
    }

    public List<EventResponse> findAllEvents(Pageable pageable) {
        List<Event> events = eventRepository.findAllWithDetails(pageable).getContent();
        return enrichWithStats(events);
    }


    public EventResponse findEventById(UUID id) {
        Event event = eventRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        long count = eventViewRepository.countByEventId(id);
        Set<UUID> trending = getTrendingIds();
        return eventMapper.toResponse(event, count, trending.contains(id));
    }

    public List<EventResponse> findEventsByVenueId(UUID venueId, Pageable pageable) {
        List<Event> events = eventRepository.findByVenueIdWithDetails(venueId, pageable).getContent();
        return enrichWithStats(events);
    }

    public List<EventResponse> findUpcomingEvents() {
        List<Event> events = eventRepository.findUpcomingEvents(LocalDateTime.now());
        return enrichWithStats(events);
    }

    @Transactional
    public EventResponse recordViewAndFind(UUID id, String clientIp) {
        Event event = eventRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        LocalDateTime cooldown = LocalDateTime.now().minusMinutes(30);
        boolean alreadyViewed = eventViewRepository.existsRecentView(id, clientIp, cooldown);

        if (!alreadyViewed) {
            EventView view = new EventView();
            view.setEvent(event);
            view.setViewerIp(clientIp);
            eventViewRepository.save(view);
        }

        long count = eventViewRepository.countByEventId(id);
        Set<UUID> trending = getTrendingIds();
        return eventMapper.toResponse(event, count, trending.contains(id));
    }

    public List<EventResponse> findTrendingEvents() {
        LocalDateTime since = LocalDateTime.now().minus(TRENDING_WINDOW);
        List<Event> events = eventViewRepository.findTrendingEvents(since, TRENDING_COUNT);
        Set<UUID> trendingIds = events.stream().map(Event::getId).collect(Collectors.toSet());
        return events.stream()
                .map(e -> {
                    long count = eventViewRepository.countByEventId(e.getId());
                    return eventMapper.toResponse(e, count, trendingIds.contains(e.getId()));
                }).toList();
    }


    @Cacheable("trendingIds")
    public Set<UUID> getTrendingIds() {
        LocalDateTime since = LocalDateTime.now().minus(TRENDING_WINDOW);
        return eventViewRepository.findTrendingEvents(since, TRENDING_COUNT)
                .stream().map(Event::getId).collect(Collectors.toSet());
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats"}, allEntries = true)
    public EventResponse createEvent(CreateEventRequest dto, String keycloakSub, List<String> roles) {
        boolean isAdmin = roles != null && roles.contains("admin");

        if (!isAdmin) {
            Venue venue = venueRepository.findById(dto.venueId())
                    .orElseThrow(() -> new VenueNotFoundException("Venue not found"));
            UUID requesterId = UUID.fromString(keycloakSub);
            if (!venue.getVenueOwner().getId().equals(requesterId)) {
                throw new ReservationAccessDeniedException("You can only create events for your own venue");
            }
        }

        Event event = eventMapper.toEntity(dto);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse uploadEventImage(UUID id, MultipartFile file, String keycloakSub, List<String> roles) {
        Event event = eventRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        boolean isAdmin = roles != null && roles.contains("admin");
        if (!isAdmin) {
            if (!event.getVenue().getVenueOwner().getId().equals(UUID.fromString(keycloakSub)))
                throw new ReservationAccessDeniedException("Access denied");
        }
        if (event.getImageFileId() != null) {
            imageKitService.deleteImage(event.getImageFileId());
        }

        String[] result = imageKitService.uploadImage(file, "events/" + id);
        event.setImageUrl(result[0]);
        event.setImageFileId(result[1]);

        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse deleteEventImage(UUID id, String keycloakSub, List<String> roles) {
        Event event = eventRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        boolean isAdmin = roles != null && roles.contains("admin");
        if (!isAdmin) {
            if (!event.getVenue().getVenueOwner().getId().equals(UUID.fromString(keycloakSub)))
                throw new ReservationAccessDeniedException("Access denied");
        }

        if (event.getImageFileId() != null) {
            imageKitService.deleteImage(event.getImageFileId());
            event.setImageUrl(null);
            event.setImageFileId(null);
        }

        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats"}, allEntries = true)
    public EventResponse updateEvent(UpdateEventRequest dto, UUID id, String keycloakSub, List<String> roles) {
        Event event = eventRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        boolean isAdmin = roles != null && roles.contains("admin");

        if (!isAdmin) {
            UUID requesterId = UUID.fromString(keycloakSub);
            if (!event.getVenue().getVenueOwner().getId().equals(requesterId)) {
                throw new ReservationAccessDeniedException("You can only update events for your own venue");
            }
        }

        eventMapper.updateEntity(dto, event);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats"}, allEntries = true)
    public void deleteEvent(UUID id, String keycloakSub, List<String> roles) {
        Event event = eventRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        boolean isAdmin = roles != null && roles.contains("admin");

        if (!isAdmin) {
            UUID requesterId = UUID.fromString(keycloakSub);
            if (!event.getVenue().getVenueOwner().getId().equals(requesterId)) {
                throw new ReservationAccessDeniedException("You can only delete events for your own venue");
            }
        }

        eventRepository.deleteById(id);
    }

    private List<EventResponse> enrichWithStats(List<Event> events) {
        if (events.isEmpty()) return List.of();

        List<UUID> ids = events.stream().map(Event::getId).toList();

        Map<UUID, Long> counts = eventViewRepository.countByEventIds(ids)
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID)  row[0],
                        row -> (Long)  row[1]
                ));

        Set<UUID> trendingIds = getTrendingIds();

        return events.stream()
                .map(e -> eventMapper.toResponse(
                        e,
                        counts.getOrDefault(e.getId(), 0L),
                        trendingIds.contains(e.getId())
                ))
                .toList();
    }
}