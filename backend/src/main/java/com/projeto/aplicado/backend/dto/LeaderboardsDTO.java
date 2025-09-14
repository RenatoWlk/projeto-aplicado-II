package com.projeto.aplicado.backend.dto;

import com.projeto.aplicado.backend.model.leaderboards.TopDonor;
import com.projeto.aplicado.backend.model.leaderboards.TopPointsUser;
import lombok.Data;

import java.util.List;

@Data
public class LeaderboardsDTO {
    private List<TopDonor> topDonors;
    private List<TopPointsUser> topPointsUsers;
}
