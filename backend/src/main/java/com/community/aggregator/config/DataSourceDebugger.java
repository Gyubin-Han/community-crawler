package com.community.aggregator.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@Slf4j
public class DataSourceDebugger {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @PostConstruct
    public void logDataSourceConfig() {
        log.info("=== DataSource Configuration ===");
        log.info("URL: {}", url);
        log.info("Username: {}", username);
        log.info("Password length: {}", password != null ? password.length() : "null");
        log.info("================================");
    }
}
