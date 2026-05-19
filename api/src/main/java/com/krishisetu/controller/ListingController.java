package com.krishisetu.controller;

import com.krishisetu.domain.Listing;
import com.krishisetu.dto.ListingCreationRequest;
import com.krishisetu.dto.ListingResponse;
import com.krishisetu.exception.NotFoundException;
import com.krishisetu.service.ListingService;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** REST controller managing endpoints for crop listings posted by registered farmers. */
@RestController
@RequestMapping("/api/v1/listings")
@Validated
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class ListingController {

  private final ListingService listingService;

  /**
   * Constructs the ListingController.
   *
   * @param listingService Listing service coordinating crop listings
   */
  public ListingController(final ListingService listingService) {
    this.listingService = listingService;
  }

  /**
   * Registers a new crop sales listing.
   *
   * @param request validation-checked Listing registration body
   * @return registered Listing detail DTO
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ListingResponse create(@Valid @RequestBody final ListingCreationRequest request) {
    final Listing listing =
        listingService.createListing(
            request.farmerId(),
            request.cropId(),
            request.quantityQ(),
            request.harvestDate(),
            request.photoUrl(),
            request.expectedPricePerQ());
    return mapToResponse(listing);
  }

  /**
   * Retrieves a specific listing by its exact UUID identifier.
   *
   * @param id listing UUID
   * @return matched Listing detail DTO
   */
  @GetMapping("/{id}")
  public ListingResponse getById(@PathVariable final UUID id) {
    final Listing listing =
        listingService
            .getListingById(id)
            .orElseThrow(() -> new NotFoundException("Listing not found for id: " + id));
    return mapToResponse(listing);
  }

  /**
   * Retrieves all listings created by a specific farmer profile.
   *
   * @param farmerId farmer profile UUID
   * @return list of crop listings for the farmer
   */
  @GetMapping("/farmer/{farmerId}")
  public List<ListingResponse> getByFarmerId(@PathVariable final UUID farmerId) {
    final List<Listing> listings = listingService.getListingsByFarmer(farmerId);
    return listings.stream().map(this::mapToResponse).toList();
  }

  private ListingResponse mapToResponse(final Listing listing) {
    return new ListingResponse(
        listing.id(),
        listing.farmer().id(),
        listing.cropId(),
        listing.quantityQ(),
        listing.harvestDate(),
        listing.photoUrl(),
        listing.expectedPricePerQ(),
        listing.status(),
        listing.createdAt());
  }
}
