package com.gdje_izlazimo.project.aspect;

import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.enums.ActionType;
import com.gdje_izlazimo.project.enums.ActivityStatus;
import com.gdje_izlazimo.project.enums.EntityType;
import com.gdje_izlazimo.project.enums.Status;
import com.gdje_izlazimo.project.repository.EventRepository;
import com.gdje_izlazimo.project.repository.RatingRepository;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import com.gdje_izlazimo.project.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityLogAspect {

    private final ActivityLogService activityLogService;
    private final ReservationRepository reservationRepository;
    private final RatingRepository ratingRepository;
    private final EventRepository eventRepository;


    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.UserService.create*(..))",
            returning = "result"
    )
    public void logUserCreation(Object result) {
        try {
            UUID userId = extractId(result);
            String userName = extractName(result);
            activityLogService.logActivity(
                    EntityType.USER, userId.toString(), userName,
                    ActionType.CREATED,
                    String.format("Novi korisnik \"%s\" je kreiran", userName),
                    ActivityStatus.SUCCESS, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log user creation", e);
        }
    }


    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.VenueService.create*(..))",
            returning = "result"
    )
    public void logVenueCreation(Object result) {
        try {
            UUID venueId = extractId(result);
            String venueName = extractName(result);
            activityLogService.logActivity(
                    EntityType.VENUE, venueId.toString(), venueName,
                    ActionType.CREATED,
                    String.format("Novi lokal \"%s\" je kreiran", venueName),
                    ActivityStatus.SUCCESS, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log venue creation", e);
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.VenueService.update*(..))",
            returning = "result"
    )
    public void logVenueUpdate(Object result) {
        try {
            UUID venueId = extractId(result);
            String venueName = extractName(result);
            activityLogService.logActivity(
                    EntityType.VENUE, venueId.toString(), venueName,
                    ActionType.UPDATED,
                    String.format("Lokal \"%s\" je ažuriran", venueName),
                    ActivityStatus.INFO, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log venue update", e);
        }
    }


    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.ReservationService.createReservation(..))",
            returning = "result"
    )
    public void logReservationCreation(Object result) {
        try {
            UUID reservationId = extractId(result);
            String venueName = extractVenueName(result);
            activityLogService.logActivity(
                    EntityType.RESERVATION, reservationId.toString(), venueName,
                    ActionType.CREATED,
                    String.format("Nova rezervacija za \"%s\" čeka odobrenje", venueName),
                    ActivityStatus.WARNING, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log reservation creation", e);
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.ReservationService.acceptReservation(..)) || " +
                    "execution(* com.gdje_izlazimo.project.service.ReservationService.rejectReservation(..)) || " +
                    "execution(* com.gdje_izlazimo.project.service.ReservationService.cancelReservation(..))"
    )
    public void logReservationStatusChange(JoinPoint joinPoint) {
        try {
            UUID reservationId = extractUuidArg(joinPoint.getArgs());
            String method = joinPoint.getSignature().getName();

            Optional<Reservation> resOpt = (reservationId != null)
                    ? reservationRepository.findByIdWithDetails(reservationId)
                    : Optional.empty();

            String venueName = resOpt.map(r -> r.getVenue() != null ? r.getVenue().getName() : "Unknown Venue")
                    .orElse("Unknown Venue");
            Status status = resOpt.map(Reservation::getStatus).orElse(null);

            String message;
            ActivityStatus activityStatus;

            if ("acceptReservation".equals(method) || status == Status.ACCEPTED) {
                message = String.format("Rezervacija za \"%s\" je prihvaćena", venueName);
                activityStatus = ActivityStatus.SUCCESS;
            } else if ("rejectReservation".equals(method) || status == Status.REJECTED) {
                message = String.format("Rezervacija za \"%s\" je odbijena", venueName);
                activityStatus = ActivityStatus.DANGER;
            } else if ("cancelReservation".equals(method) || status == Status.CANCELLED) {
                message = String.format("Rezervacija za \"%s\" je otkazana", venueName);
                activityStatus = ActivityStatus.INFO;
            } else {
                message = String.format("Status rezervacije za \"%s\" je promijenjen", venueName);
                activityStatus = ActivityStatus.INFO;
            }

            activityLogService.logActivity(
                    EntityType.RESERVATION,
                    reservationId != null ? reservationId.toString() : "unknown",
                    venueName, ActionType.STATUS_CHANGED, message, activityStatus, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log reservation status change", e);
        }
    }

    @Around("execution(* com.gdje_izlazimo.project.service.ReservationService.deleteReservation(..))")
    public Object logReservationDelete(ProceedingJoinPoint pjp) throws Throwable {
        UUID reservationId = extractUuidArg(pjp.getArgs());
        String venueName = reservationId != null
                ? reservationRepository.findByIdWithDetails(reservationId)
                .map(r -> r.getVenue() != null ? r.getVenue().getName() : "Unknown Venue")
                .orElse("Unknown Venue")
                : "Unknown Venue";

        Object result = pjp.proceed();

        try {
            activityLogService.logActivity(
                    EntityType.RESERVATION,
                    reservationId != null ? reservationId.toString() : "unknown",
                    venueName, ActionType.DELETED,
                    String.format("Rezervacija za \"%s\" je obrisana", venueName),
                    ActivityStatus.DANGER, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log reservation delete", e);
        }

        return result;
    }


    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.TableTypeService.createTableType(..))",
            returning = "result"
    )
    public void logTableTypeCreation(Object result) {
        try {
            UUID id = extractId(result);
            String name = extractName(result);
            activityLogService.logActivity(
                    EntityType.TABLE_TYPE, id.toString(), name,
                    ActionType.CREATED,
                    String.format("Dodat tip stola \"%s\"", name),
                    ActivityStatus.SUCCESS, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log table type creation", e);
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.TableTypeService.updateTableType(..))",
            returning = "result"
    )
    public void logTableTypeUpdate(Object result) {
        try {
            UUID id = extractId(result);
            String name = extractName(result);
            activityLogService.logActivity(
                    EntityType.TABLE_TYPE, id.toString(), name,
                    ActionType.UPDATED,
                    String.format("Ažuriran tip stola \"%s\"", name),
                    ActivityStatus.INFO, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log table type update", e);
        }
    }

    @Around("execution(* com.gdje_izlazimo.project.service.TableTypeService.deleteTableType(..))")
    public Object logTableTypeDelete(ProceedingJoinPoint pjp) throws Throwable {
        UUID id = extractUuidArg(pjp.getArgs());
        Object result = pjp.proceed();
        try {
            activityLogService.logActivity(
                    EntityType.TABLE_TYPE,
                    id != null ? id.toString() : "unknown",
                    "TableType", ActionType.DELETED,
                    "Tip stola je obrisan",
                    ActivityStatus.DANGER, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log table type delete", e);
        }
        return result;
    }


    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.RatingService.createRating(..))",
            returning = "result"
    )
    public void logRatingCreation(Object result) {
        try {
            RatingResponse r = (RatingResponse) result;
            activityLogService.logActivity(
                    EntityType.RATING, r.id().toString(), r.userName(),
                    ActionType.CREATED,
                    String.format("Korisnik \"%s\" je ostavio ocjenu %d/5", r.userName(), r.rating()),
                    ActivityStatus.SUCCESS, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log rating creation", e);
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.RatingService.updateRating(..))",
            returning = "result"
    )
    public void logRatingUpdate(Object result) {
        try {
            RatingResponse r = (RatingResponse) result;
            activityLogService.logActivity(
                    EntityType.RATING, r.id().toString(), r.userName(),
                    ActionType.UPDATED,
                    String.format("Korisnik \"%s\" je izmijenio ocjenu na %d/5", r.userName(), r.rating()),
                    ActivityStatus.INFO, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log rating update", e);
        }
    }

    @Around("execution(* com.gdje_izlazimo.project.service.RatingService.deleteRating(..))")
    public Object logRatingDelete(ProceedingJoinPoint pjp) throws Throwable {
        UUID ratingId = extractUuidArg(pjp.getArgs());

        String userName = ratingId != null
                ? ratingRepository.findByIdWithVenue(ratingId)
                .map(r -> r.getUser() != null ? r.getUser().getName() : "Unknown")
                .orElse("Unknown")
                : "Unknown";

        Object result = pjp.proceed();

        try {
            activityLogService.logActivity(
                    EntityType.RATING,
                    ratingId != null ? ratingId.toString() : "unknown",
                    userName, ActionType.DELETED,
                    String.format("Ocjena korisnika \"%s\" je obrisana", userName),
                    ActivityStatus.DANGER, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log rating delete", e);
        }

        return result;
    }


    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.EventService.createEvent(..))",
            returning = "result"
    )
    public void logEventCreation(Object result) {
        try {
            EventResponse e = (EventResponse) result;
            activityLogService.logActivity(
                    EntityType.EVENT, e.id().toString(), e.name(),
                    ActionType.CREATED,
                    String.format("Novi event \"%s\" je kreiran u lokalu \"%s\"", e.name(), e.venueName()),
                    ActivityStatus.SUCCESS, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log event creation", e);
        }
    }

    @AfterReturning(
            pointcut = "execution(* com.gdje_izlazimo.project.service.EventService.updateEvent(..))",
            returning = "result"
    )
    public void logEventUpdate(Object result) {
        try {
            EventResponse e = (EventResponse) result;
            activityLogService.logActivity(
                    EntityType.EVENT, e.id().toString(), e.name(),
                    ActionType.UPDATED,
                    String.format("Event \"%s\" u lokalu \"%s\" je ažuriran", e.name(), e.venueName()),
                    ActivityStatus.INFO, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log event update", e);
        }
    }

    @Around("execution(* com.gdje_izlazimo.project.service.EventService.deleteEvent(..))")
    public Object logEventDelete(ProceedingJoinPoint pjp) throws Throwable {
        UUID eventId = extractUuidArg(pjp.getArgs());

        String eventName = "Unknown";
        String venueName = "Unknown";
        if (eventId != null) {
            Optional<Event> eventOpt = eventRepository.findByIdWithDetails(eventId);
            eventName = eventOpt.map(Event::getName).orElse("Unknown");
            venueName = eventOpt.map(ev -> ev.getVenue() != null ? ev.getVenue().getName() : "Unknown").orElse("Unknown");
        }

        Object result = pjp.proceed();

        try {
            activityLogService.logActivity(
                    EntityType.EVENT,
                    eventId != null ? eventId.toString() : "unknown",
                    eventName, ActionType.DELETED,
                    String.format("Event \"%s\" iz lokala \"%s\" je obrisan", eventName, venueName),
                    ActivityStatus.DANGER, getCurrentUsername()
            );
        } catch (Exception e) {
            log.error("Failed to log event delete", e);
        }

        return result;
    }



    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getName() != null) ? auth.getName() : "system";
    }

    private UUID extractId(Object result) {
        try {
            Object id = result.getClass().getMethod("id").invoke(result);
            if (id instanceof UUID) return (UUID) id;
            return UUID.fromString(id.toString());
        } catch (Exception e) {
            log.warn("Could not extract ID from result", e);
            return UUID.randomUUID();
        }
    }

    private String extractName(Object result) {
        try {
            Object name = result.getClass().getMethod("name").invoke(result);
            return name != null ? name.toString() : "Unknown";
        } catch (Exception e) {
            log.warn("Could not extract name from result", e);
            return "Unknown";
        }
    }

    private String extractVenueName(Object result) {
        try {
            Object venueName = result.getClass().getMethod("venueName").invoke(result);
            return venueName != null ? venueName.toString() : "Unknown Venue";
        } catch (Exception e) {
            log.warn("Could not extract venue name from result", e);
            return "Unknown Venue";
        }
    }

    private UUID extractUuidArg(Object[] args) {
        if (args == null) return null;
        for (Object arg : args) {
            if (arg instanceof UUID) return (UUID) arg;
            if (arg != null) {
                try { return UUID.fromString(arg.toString()); } catch (Exception ignored) {}
            }
        }
        return null;
    }
}