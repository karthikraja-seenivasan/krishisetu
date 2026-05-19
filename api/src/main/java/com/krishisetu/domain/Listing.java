package com.krishisetu.domain;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Listing JPA domain model representing crop sales postings by registered farmers. */
@Entity
@Table(name = "listings")
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class Listing {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "farmer_id", nullable = false)
  private Farmer farmer;

  @Column(name = "crop_id", nullable = false)
  private String cropId;

  @Column(name = "quantity_q", nullable = false, precision = 10, scale = 2)
  private BigDecimal quantityQ;

  @Column(name = "harvest_date", nullable = false)
  private LocalDate harvestDate;

  @Column(name = "photo_url", length = 2048)
  private String photoUrl;

  @Column(name = "expected_price_per_q", precision = 10, scale = 2)
  private BigDecimal expectedPricePerQ;

  @Column(nullable = false)
  private String status = "open";

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Listing() {}

  /**
   * Constructs a crop listing.
   *
   * @param farmer reference to registered Farmer entity
   * @param cropId specific ICAR identifier (e.g. tomato)
   * @param quantityQ crop quantity in quintals
   * @param harvestDate expected harvesting schedule
   * @param photoUrl path to Supabase-stored listing thumbnail
   * @param expectedPricePerQ minimum bid target per quintal
   */
  public Listing(
      final Farmer farmer,
      final String cropId,
      final BigDecimal quantityQ,
      final LocalDate harvestDate,
      final String photoUrl,
      final BigDecimal expectedPricePerQ) {
    this.farmer = farmer;
    this.cropId = cropId;
    this.quantityQ = quantityQ;
    this.harvestDate = harvestDate;
    this.photoUrl = photoUrl;
    this.expectedPricePerQ = expectedPricePerQ;
  }

  public UUID id() {
    return id;
  }

  public Farmer farmer() {
    return farmer;
  }

  public String cropId() {
    return cropId;
  }

  public BigDecimal quantityQ() {
    return quantityQ;
  }

  public LocalDate harvestDate() {
    return harvestDate;
  }

  public String photoUrl() {
    return photoUrl;
  }

  public BigDecimal expectedPricePerQ() {
    return expectedPricePerQ;
  }

  public String status() {
    return status;
  }

  public Instant createdAt() {
    return createdAt;
  }

  /**
   * Explicitly transitions status context.
   *
   * @param status new state value (e.g. accepted, closed)
   */
  public void updateStatus(final String status) {
    this.status = status;
  }
}
