package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.exception.custom.EventNotFoundException;
import com.gdje_izlazimo.project.mapper.EventMapper;
import com.gdje_izlazimo.project.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public EventService(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    public List<EventResponse> findAllEvents(){

        List<Event> responses = eventRepository.findAll();

        return responses.stream()
                .map(eventMapper::toResponse)
                .toList();

    }

    public EventResponse findEventById(UUID id){

        Event response = eventRepository.findById(id).orElseThrow(
                () -> new EventNotFoundException("Event does not exist"));

        return eventMapper.toResponse(response);

    }

    public EventResponse createEvent(CreateEventRequest dto){

        Event createdEvent = eventMapper.toEntity(dto);
        Event savedEvent = eventRepository.save(createdEvent);

        return eventMapper.toResponse(savedEvent);

    }

    public EventResponse updateEvent(UpdateEventRequest dto, UUID id){

        Event event = eventRepository.findById(id).orElseThrow(
                () -> new EventNotFoundException("Event does not exist"));

        eventMapper.updateEntity(dto, event);
        Event updatedEvent = eventRepository.save(event);

        return eventMapper.toResponse(updatedEvent);

    }

    public void deleteEvent(UUID id){

        if(!eventRepository.existsById(id)){
            throw new EventNotFoundException("Event does not exist");
        }
        eventRepository.deleteById(id);

    }

}