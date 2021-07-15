package com.consdata.kouncil;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class KouncilControllerAdvisor {

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<String> handleException(Exception ex) {
        String message = ex.getMessage();
        log.error("Received Exception message={}", message, ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getMessage());
    }

    @ExceptionHandler(HttpMessageNotWritableException.class)
    public final ResponseEntity<String> handleException(HttpMessageNotWritableException ex) {
        String message = ex.getMessage();
        log.error("Received HttpMessageNotWritableException message={}", message, ex);
        return null; // for BrokenPipe problem on closed websocket
    }
}
