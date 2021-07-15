package com.consdata.kouncil.track;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class DestinationStore {

    private final Set<String> activeDestinations = new HashSet<>();

    public void registerDestination(String destination) {
        activeDestinations.add(destination);
    }

    public void unregisterDestination(String destination) {
        activeDestinations.remove(destination);
    }

    public boolean destinationIsActive(String destination) {
        return activeDestinations.contains(destination);
    }

    public Set<String> getActiveDestinations() {
        return this.activeDestinations;
    }
}
