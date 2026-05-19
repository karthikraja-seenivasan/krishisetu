package com.krishisetu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.krishisetu.domain.Farmer;
import com.krishisetu.domain.Listing;
import com.krishisetu.exception.ValidationException;
import com.krishisetu.repository.FarmerRepository;
import com.krishisetu.repository.ListingRepository;
import com.krishisetu.service.FarmerService;
import com.krishisetu.service.ListingService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * High-fidelity integration test class verifying end-to-end Farmer and Listing database
 * persistence, relationships, and security-driven validation rules.
 */
@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
      "spring.jpa.hibernate.ddl-auto=validate",
      "spring.flyway.enabled=true",
      "bucket4j.enabled=false"
    })
@ActiveProfiles("test")
@Transactional
class FarmerListingIntegrationTest {

  @Autowired private FarmerService farmerService;

  @Autowired private ListingService listingService;

  @Autowired private FarmerRepository farmerRepository;

  @Autowired private ListingRepository listingRepository;

  @Test
  void testFarmerRegistrationAndSecureHashing() {
    final String phone = "9876543210";
    final Farmer farmer = farmerService.registerFarmer("Mahadeva", phone, "Kolar", "kn");

    assertNotNull(farmer.id());
    assertEquals("Mahadeva", farmer.name());
    assertEquals("Kolar", farmer.district());
    assertEquals("kn", farmer.preferredLang());

    // Verify phone number hash is present and not cleartext PII
    assertNotNull(farmer.phoneHash());
    assertTrue(!farmer.phoneHash().equals(phone));
    assertEquals(64, farmer.phoneHash().length()); // SHA-256 length in hex

    // Verify fetching by phone hashes correctly and returns matching profile
    final Optional<Farmer> fetched = farmerService.getFarmerByPhone(phone);
    assertTrue(fetched.isPresent());
    assertEquals(farmer.id(), fetched.get().id());
  }

  @Test
  void testCreateListingWithValidations() {
    final Farmer farmer = farmerService.registerFarmer("Basappa", "8888877777", "Tumkur", "en");

    final BigDecimal qty = new BigDecimal("25.50");
    final LocalDate harvestDate = LocalDate.now().plusMonths(2);
    final BigDecimal expectedPrice = new BigDecimal("1200.00");
    final String supabasePhotoUrl =
        "https://krishisetu.supabase.co/storage/v1/object/public/listings/t.jpg";

    final Listing listing =
        listingService.createListing(
            farmer.id(), "tomato", qty, harvestDate, supabasePhotoUrl, expectedPrice);

    assertNotNull(listing.id());
    assertEquals(farmer.id(), listing.farmer().id());
    assertEquals("tomato", listing.cropId());
    assertEquals(0, qty.compareTo(listing.quantityQ()));
    assertEquals(harvestDate, listing.harvestDate());
    assertEquals(supabasePhotoUrl, listing.photoUrl());
    assertEquals(0, expectedPrice.compareTo(listing.expectedPricePerQ()));
    assertEquals("open", listing.status());

    // Verify fetching lists for farmer
    final List<Listing> list = listingService.getListingsByFarmer(farmer.id());
    assertEquals(1, list.size());
    assertEquals(listing.id(), list.get(0).id());
  }

  @Test
  void testListingCreationRejectsNonSupabasePhotoUrl() {
    final Farmer farmer =
        farmerService.registerFarmer("Chennappa", "7777766666", "Chintamani", "kn");

    final BigDecimal qty = new BigDecimal("15.00");
    final LocalDate harvestDate = LocalDate.now().plusWeeks(3);
    final BigDecimal price = new BigDecimal("850.00");
    final String maliciousUrl = "https://untrusted-domain.com/hack.jpg";

    // Expect validation error when URL is not from Supabase Storage
    assertThrows(
        ValidationException.class,
        () ->
            listingService.createListing(
                farmer.id(), "maize", qty, harvestDate, maliciousUrl, price));
  }
}
