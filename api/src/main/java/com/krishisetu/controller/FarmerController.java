package com.krishisetu.controller;

import com.krishisetu.domain.Farmer;
import com.krishisetu.dto.FarmerRegistrationRequest;
import com.krishisetu.dto.FarmerResponse;
import com.krishisetu.exception.NotFoundException;
import com.krishisetu.service.FarmerService;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
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

/** REST controller managing endpoints for Farmer profile registry and coordinate references. */
@RestController
@RequestMapping("/api/v1/farmers")
@Validated
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class FarmerController {

  private final FarmerService farmerService;

  /**
   * Constructs the FarmerController.
   *
   * @param farmerService Farmer service managing registries
   */
  public FarmerController(final FarmerService farmerService) {
    this.farmerService = farmerService;
  }

  /**
   * Registers a new Farmer profile.
   *
   * @param request validation-checked Farmer registration body
   * @return registered Farmer detail DTO
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public FarmerResponse register(@Valid @RequestBody final FarmerRegistrationRequest request) {
    final Farmer farmer =
        farmerService.registerFarmer(
            request.name(), request.phone(), request.district(), request.preferredLang());
    return mapToResponse(farmer);
  }

  /**
   * Retrieves a farmer by exact UUID identifier.
   *
   * @param id profile UUID string
   * @return matched Farmer detail DTO
   */
  @GetMapping("/{id}")
  public FarmerResponse getById(@PathVariable final UUID id) {
    final Farmer farmer =
        farmerService
            .getFarmerById(id)
            .orElseThrow(() -> new NotFoundException("Farmer not found for id: " + id));
    return mapToResponse(farmer);
  }

  private FarmerResponse mapToResponse(final Farmer farmer) {
    return new FarmerResponse(
        farmer.id(), farmer.name(), farmer.district(), farmer.preferredLang(), farmer.createdAt());
  }
}
