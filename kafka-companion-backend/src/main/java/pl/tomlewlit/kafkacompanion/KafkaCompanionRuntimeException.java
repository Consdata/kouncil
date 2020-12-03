package pl.tomlewlit.kafkacompanion;

public class KafkaCompanionRuntimeException extends RuntimeException {
    public KafkaCompanionRuntimeException(Exception e) {
        super(e);
    }
}
