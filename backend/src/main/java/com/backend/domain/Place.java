package com.backend.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Place {


    private Long id;


    private String placeName;


    private String placeUrl;


    private String address;


    private String category;


    private Double latitude;


    private Double longitude;

    private LocalDateTime createdAt;

    // 생성자, getter, setter 등 필요한 메서드들 추가

}

