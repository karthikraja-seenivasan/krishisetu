package com.krishisetu.repository;

import com.krishisetu.domain.Farmer;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Spring Data JPA Repository interface managing CRUD routines on Farmer table. */
@Repository
public interface FarmerRepository extends JpaRepository<Farmer, UUID> {

  /**
   * Retrieves a farmer by exact phone number hash.
   *
   * @param phoneHash salted SHA-256 phone representation
   * @return optional containing matched Farmer if exists
   */
  Optional<Farmer> findByPhoneHash(String phoneHash);
}
