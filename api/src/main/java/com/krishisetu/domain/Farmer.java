package com.krishisetu.domain;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Farmer JPA domain model representing smallholder agricultural registry details. */
@Entity
@Table(name = "farmers")
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class Farmer {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "phone_hash", nullable = false, unique = true)
  private String phoneHash;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String district;

  @Column(precision = 8, scale = 5)
  private BigDecimal lat;

  @Column(precision = 8, scale = 5)
  private BigDecimal lon;

  @Column(name = "preferred_lang", nullable = false)
  private String preferredLang = "kn";

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Farmer() {}

  /**
   * Constructs a Farmer profile.
   *
   * @param phoneHash salted SHA-256 hash representing phone number
   * @param name farmer display name
   * @param district regional administrative center (e.g. Kolar)
   * @param preferredLang farmer visual interface language (kn / en)
   */
  public Farmer(
      final String phoneHash,
      final String name,
      final String district,
      final String preferredLang) {
    this.phoneHash = phoneHash;
    this.name = name;
    this.district = district;
    this.preferredLang = preferredLang;
  }

  public UUID id() {
    return id;
  }

  public String phoneHash() {
    return phoneHash;
  }

  public String name() {
    return name;
  }

  public String district() {
    return district;
  }

  public BigDecimal lat() {
    return lat;
  }

  public BigDecimal lon() {
    return lon;
  }

  public String preferredLang() {
    return preferredLang;
  }

  public Instant createdAt() {
    return createdAt;
  }

  /**
   * Explicitly updates coordinates context.
   *
   * @param lat latitude double
   * @param lon longitude double
   */
  public void updateCoordinates(final BigDecimal lat, final BigDecimal lon) {
    this.lat = lat;
    this.lon = lon;
  }
}
