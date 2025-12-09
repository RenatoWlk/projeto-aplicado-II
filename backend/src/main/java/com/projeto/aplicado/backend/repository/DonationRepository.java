package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.Donation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends MongoRepository<Donation, String> {

    /**
     * Retrieves all donations made by a specific user, ordered by date and hour (descending).
     */
    List<Donation> findByUserIdOrderByDateDescHourDesc(String userId);

    /**
     * Retrieves donations for a user filtered by specific status values,
     * ordered by date and hour (descending).
     */
    List<Donation> findByUserIdAndStatusInOrderByDateDescHourDesc(
            String userId, List<Donation.DonationStatus> statuses);

    /**
     * Retrieves donations for a specific blood bank, ordered by date and hour (ascending).
     */
    List<Donation> findByBloodBankIdOrderByDateAscHourAsc(String bloodBankId);

    /**
     * Retrieves donations for a blood bank on a specific date
     * filtered by given status values, ordered by hour (ascending).
     */
    List<Donation> findByBloodBankIdAndDateAndStatusInOrderByHourAsc(
            String bloodBankId, String date, List<Donation.DonationStatus> statuses);

    /**
     * Retrieves donations for a blood bank on a specific date and hour,
     * filtered by given status values.
     */
    List<Donation> findByBloodBankIdAndDateAndHourAndStatusIn(
            String bloodBankId, String date, String hour, List<Donation.DonationStatus> statuses);

    /**
     * Retrieves donations for a blood bank where the date starts with the given prefix.
     * Useful for month-based queries (e.g., "2025-12").
     */
    @Query("{ 'bloodBankId': ?0, 'date': { $regex: ?1 }, 'status': { $in: ?2 } }")
    List<Donation> findByBloodBankIdAndDateStartsWithAndStatusIn(
            String bloodBankId, String datePrefix, List<Donation.DonationStatus> statuses);

    /**
     * Counts the number of occupied time slots for a specific blood bank, date and hour,
     * filtered by given status values.
     */
    long countByBloodBankIdAndDateAndHourAndStatusIn(
            String bloodBankId, String date, String hour, List<Donation.DonationStatus> statuses);

    /**
     * Retrieves upcoming donations for a blood bank within a date range
     * filtered by given status values.
     */
    @Query("{ 'bloodBankId': ?0, 'date': { $gte: ?1, $lte: ?2 }, 'status': { $in: ?3 } }")
    List<Donation> findUpcomingDonations(
            String bloodBankId, String startDate, String endDate, List<Donation.DonationStatus> statuses);

    /**
     * Checks whether a user already has a scheduled donation for a specific date
     * with one of the given status values.
     */
    Optional<Donation> findByUserIdAndDateAndStatusIn(
            String userId, String date, List<Donation.DonationStatus> statuses);

    /**
     * Retrieves a donation by its ID ensuring it belongs to the specified user.
     * Used for access control.
     */
    Optional<Donation> findByIdAndUserId(String id, String userId);

    /**
     * Retrieves a donation by its ID ensuring it belongs to the specified blood bank.
     * Used for blood bank actions.
     */
    Optional<Donation> findByIdAndBloodBankId(String id, String bloodBankId);
}