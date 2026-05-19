package com.krishisetu.service;

import com.krishisetu.domain.Farmer;
import com.krishisetu.exception.KrishisetuException;
import com.krishisetu.repository.FarmerRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service managing Farmer registration, profile lifecycle, and secure data hashing. */
@Service
public class FarmerService {

  private static final Logger LOG = LoggerFactory.getLogger(FarmerService.class);
  private final FarmerRepository farmerRepository;

  /**
   * Constructs the FarmerService.
   *
   * @param farmerRepository Farmer repository interface
   */
  public FarmerService(final FarmerRepository farmerRepository) {
    this.farmerRepository = farmerRepository;
  }

  /**
   * Registers a new farmer securely. Uses SHA-256 to hash phone number before persistence to comply
   * with PII privacy rules.
   *
   * @param name farmer display name
   * @param phone farmer mobile phone number
   * @param district regional administrative center
   * @param preferredLang farmer choice of UI language (kn / en)
   * @return registered Farmer entity
   */
  @Transactional
  public Farmer registerFarmer(
      final String name, final String phone, final String district, final String preferredLang) {
    final String phoneHash = hashPhone(phone);
    LOG.info("Registering new farmer profile with masked phone hash={}", maskHash(phoneHash));

    final Optional<Farmer> existing = farmerRepository.findByPhoneHash(phoneHash);
    if (existing.isPresent()) {
      LOG.info(
          "Farmer already registered, returning existing record for id={}", existing.get().id());
      return existing.get();
    }

    final Farmer farmer = new Farmer(phoneHash, name, district, preferredLang);
    return farmerRepository.save(farmer);
  }

  /**
   * Retrieves a farmer by exact UUID identifier.
   *
   * @param id unique profile identifier
   * @return optional containing matching Farmer if exists
   */
  public Optional<Farmer> getFarmerById(final UUID id) {
    return farmerRepository.findById(id);
  }

  /**
   * Retrieves a farmer by exact phone number.
   *
   * @param phone cleartext phone number
   * @return optional containing matching Farmer if exists
   */
  public Optional<Farmer> getFarmerByPhone(final String phone) {
    final String phoneHash = hashPhone(phone);
    return farmerRepository.findByPhoneHash(phoneHash);
  }

  private String hashPhone(final String phone) {
    try {
      final MessageDigest digest = MessageDigest.getInstance("SHA-256");
      final byte[] hash = digest.digest(phone.getBytes(StandardCharsets.UTF_8));
      final StringBuilder hexString = new StringBuilder();
      for (final byte b : hash) {
        final String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) {
          hexString.append('0');
        }
        hexString.append(hex);
      }
      return hexString.toString();
    } catch (Exception ex) {
      throw new KrishisetuException("Failed to hash phone number securely", ex);
    }
  }

  private String maskHash(final String hash) {
    if (hash == null || hash.length() < 8) {
      return "XXXX";
    }
    return hash.substring(0, 4) + "..." + hash.substring(hash.length() - 4);
  }
}
