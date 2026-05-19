package com.krishisetu;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/** Standard integration test verifying Spring context loading correctly. */
@SpringBootTest(
    properties = {
      "bucket4j.enabled=false",
      "spring.autoconfigure.exclude="
          + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
          + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,"
          + "com.giffing.bucket4j.spring.boot.starter.config.Bucket4JAutoConfiguration"
    })
class KrishiSetuApplicationTests {

  @org.springframework.boot.test.mock.mockito.MockBean
  private com.krishisetu.service.FarmerService farmerService;

  @org.springframework.boot.test.mock.mockito.MockBean
  private com.krishisetu.service.ListingService listingService;

  @org.springframework.boot.test.mock.mockito.MockBean
  private com.krishisetu.repository.FarmerRepository farmerRepository;

  @org.springframework.boot.test.mock.mockito.MockBean
  private com.krishisetu.repository.ListingRepository listingRepository;

  @Test
  void contextLoads() {}
}
