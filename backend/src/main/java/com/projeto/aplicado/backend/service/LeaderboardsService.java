package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.LeaderboardsDTO;
import com.projeto.aplicado.backend.model.leaderboards.TopDonor;
import com.projeto.aplicado.backend.model.leaderboards.TopPointsUser;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardsService {
    private final UserRepository userRepository;

    public LeaderboardsDTO getLeaderboards() {
        List<User> users = userRepository.findAllUsers();

        List<TopDonor> topDonors = users.stream()
                .filter(user -> user.getTimesDonated() > 0)
                .sorted(Comparator.comparingInt(User::getTimesDonated).reversed())
                .limit(50)
                .map(user -> {
                    TopDonor dto = new TopDonor();
                    dto.setName(user.getName());
                    dto.setTotalDonations(user.getTimesDonated());
                    dto.setBloodType(user.getBloodType());
                    return dto;
                })
                .collect(Collectors.toList());

        List<TopPointsUser> topPointsUsers = users.stream()
                .filter(user -> user.getTotalPoints() > 0)
                .sorted(Comparator.comparingInt(User::getTotalPoints).reversed())
                .limit(50)
                .map(user -> {
                    TopPointsUser dto = new TopPointsUser();
                    dto.setName(user.getName());
                    dto.setPoints(user.getTotalPoints());
                    dto.setBloodType(user.getBloodType());
                    return dto;
                })
                .collect(Collectors.toList());

        LeaderboardsDTO dto = new LeaderboardsDTO();
        dto.setTopDonors(topDonors);
        dto.setTopPointsUsers(topPointsUsers);
        return dto;
    }
}
