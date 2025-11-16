package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.users.Donation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends MongoRepository<Donation, String> {

    // Buscar por usuário
    List<Donation> findByUserIdOrderByDateDescHourDesc(String userId);

    // Buscar por usuário com status específicos
    List<Donation> findByUserIdAndStatusInOrderByDateDescHourDesc(
            String userId, List<Donation.DonationStatus> statuses);

    // Buscar por banco de sangue
    List<Donation> findByBloodBankIdOrderByDateAscHourAsc(String bloodBankId);

    // Buscar por banco de sangue e data
    List<Donation> findByBloodBankIdAndDateAndStatusInOrderByHourAsc(
            String bloodBankId, String date, List<Donation.DonationStatus> statuses);

    // Buscar por banco de sangue, data e hora
    List<Donation> findByBloodBankIdAndDateAndHourAndStatusIn(
            String bloodBankId, String date, String hour, List<Donation.DonationStatus> statuses);

    // DonationRepository.java
    @Query("{ 'bloodBankId': ?0, 'date': { $regex: ?1 }, 'status': { $in: ?2 } }")
    List<Donation> findByBloodBankIdAndDateStartsWithAndStatusIn(
            String bloodBankId, String datePrefix, List<Donation.DonationStatus> statuses);

    // Contar slots ocupados
    long countByBloodBankIdAndDateAndHourAndStatusIn(
            String bloodBankId, String date, String hour, List<Donation.DonationStatus> statuses);

    // Buscar próximos agendamentos
    @Query("{ 'bloodBankId': ?0, 'date': { $gte: ?1, $lte: ?2 }, 'status': { $in: ?3 } }")
    List<Donation> findUpcomingDonations(
            String bloodBankId, String startDate, String endDate, List<Donation.DonationStatus> statuses);

    // Verificar agendamento duplicado
    Optional<Donation> findByUserIdAndDateAndStatusIn(
            String userId, String date, List<Donation.DonationStatus> statuses);

    // Buscar por ID e userId (para garantir que apenas o dono acesse)
    Optional<Donation> findByIdAndUserId(String id, String userId);

    // Buscar por ID e bloodBankId (para ações do banco)
    Optional<Donation> findByIdAndBloodBankId(String id, String bloodBankId);
}