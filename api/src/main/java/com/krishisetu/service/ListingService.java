package com.krishisetu.service;

import com.krishisetu.domain.Farmer;
import com.krishisetu.domain.Listing;
import com.krishisetu.exception.ValidationException;
import com.krishisetu.repository.FarmerRepository;
import com.krishisetu.repository.ListingRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service managing crop sales listing creation, status tracking, and storage validations. */
@Service
public class ListingService {

  private static final Logger LOG = LoggerFactory.getLogger(ListingService.class);
  private final ListingRepository listingRepository;
  private final FarmerRepository farmerRepository;

  /**
   * Constructs the ListingService.
   *
   * @param listingRepository Listing repository
   * @param farmerRepository Farmer repository
   */
  public ListingService(
      final ListingRepository listingRepository, final FarmerRepository farmerRepository) {
    this.listingRepository = listingRepository;
    this.farmerRepository = farmerRepository;
  }

  /**
   * Creates and registers a new crop listing for a farmer. Validates that the associated photo URL
   * belongs to secure Supabase cloud storage.
   *
   * @param farmerId registered farmer's profile identifier
   * @param cropId specific crop standard tag
   * @param quantityQ volume in quintals
   * @param harvestDate projected harvest date
   * @param photoUrl path to Supabase uploaded media
   * @param expectedPricePerQ minimum bid target per quintal
   * @return created and persisted Listing
   */
  @Transactional
  public Listing createListing(
      final UUID farmerId,
      final String cropId,
      final BigDecimal quantityQ,
      final LocalDate harvestDate,
      final String photoUrl,
      final BigDecimal expectedPricePerQ) {
    LOG.info("Registering crop listing for farmerId={}, cropId={}", farmerId, cropId);

    final Farmer farmer =
        farmerRepository
            .findById(farmerId)
            .orElseThrow(
                () -> new ValidationException("farmerId", "Farmer profile does not exist"));

    // Server-side validation for Supabase Storage URL constraint
    if (photoUrl != null && !photoUrl.trim().isEmpty() && !photoUrl.contains("supabase")) {
      throw new ValidationException(
          "photoUrl", "Listing media must be stored securely on Supabase Storage");
    }

    final Listing listing =
        new Listing(farmer, cropId, quantityQ, harvestDate, photoUrl, expectedPricePerQ);
    return listingRepository.save(listing);
  }

  /**
   * Retrieves a listing by exact UUID identifier.
   *
   * @param id unique listing identifier
   * @return optional containing matching Listing if exists
   */
  public Optional<Listing> getListingById(final UUID id) {
    return listingRepository.findById(id);
  }

  /**
   * Retrieves all listings associated with a registered farmer.
   *
   * @param farmerId unique identifier of the registered farmer
   * @return list of matching Listings
   */
  public List<Listing> getListingsByFarmer(final UUID farmerId) {
    return listingRepository.findByFarmerId(farmerId);
  }
}
