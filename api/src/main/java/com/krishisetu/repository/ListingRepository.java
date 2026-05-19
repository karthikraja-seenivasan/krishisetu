package com.krishisetu.repository;

import com.krishisetu.domain.Listing;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Spring Data JPA Repository interface managing CRUD routines on Listing table. */
@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

  /**
   * Retrieves all listings associated with a specific farmer.
   *
   * @param farmerId unique identifier of the registered farmer
   * @return list of matching crop listings
   */
  List<Listing> findByFarmerId(UUID farmerId);
}
