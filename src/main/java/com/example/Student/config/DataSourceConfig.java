package com.example.Student.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource(
            @Value("${MYSQLHOST:localhost}") String host,
            @Value("${MYSQLPORT:3306}") String port,
            @Value("${MYSQLDATABASE:studentdb}") String database,
            @Value("${MYSQLUSER:${DB_USERNAME:root}}") String username,
            @Value("${MYSQLPASSWORD:${DB_PASSWORD:root1234}}") String password
    ) {
        String url = String.format(
                "jdbc:mysql://%s:%s/%s?sslMode=PREFERRED&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                host, port, database
        );
        return DataSourceBuilder.create()
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .url(url)
                .username(username)
                .password(password)
                .build();
    }
}
