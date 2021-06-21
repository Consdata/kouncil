package com.consdata

import io.gatling.core.Predef._
import io.gatling.core.feeder.SourceFeederBuilder
import io.gatling.core.structure.ScenarioBuilder
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.concurrent.duration.DurationInt
import scala.language.postfixOps
import scala.util.Random

class KouncilSimulation extends Simulation {

  val headers = Map(
    "Sec-Fetch-Dest" -> "empty",
    "Sec-Fetch-Mode" -> "cors",
    "Sec-Fetch-Site" -> "same-origin",
    "sec-ch-ua" -> """ Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91""",
    "sec-ch-ua-mobile" -> "?0")

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl("https://kouncil.consdata.local")
    .inferHtmlResources(BlackList(), WhiteList())
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7")
    .userAgentHeader("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36")
    .headers(headers)

  val csvFeeder: SourceFeederBuilder[String] = csv("data.csv").circular
  val randomStringFeeder: Iterator[Map[String, String]] = Iterator.continually(Map("randomString" -> Random.alphanumeric.take(20).mkString))

  val serverId = "serverId=kouncil_consdata_local_8001"

  val scn: ScenarioBuilder = scenario("KouncilSimulation")
    .exec(http("get_topic_list_and_save_first_topicName_in_session")
      .get("/api/topics?" + serverId)
      .check(status.in(200))
      .check(jsonPath("$..name").find.saveAs("topicName")))
    .pause(3)
    .exec(http("first_topic_first_page")
      .get("/api/topic/messages/${topicName}/all/latest?" + serverId + "&offset=0&limit=20")
      .check(status.in(200)))
    .pause(3)
    .feed(csvFeeder)
    .feed(randomStringFeeder)
    .exec(http("add_message_to_topic_from_csv_feeder")
      .post("/api/topic/send/${topicName}/1?" + serverId)
      .header("Content-Type", "application/json")
      .body(StringBody("""{"key":"${key}","value":"{\"${value}\":\"${randomString}\"}","offset":null,"partition":null,"timestamp":null}""")))
    .exec(http("get_broker_list_and_println_result")
      .get("/api/brokers?" + serverId)
      .check(status.in(200))
      .check(bodyString.saveAs("BODY")))
    .exec {
      session =>
        println(session("BODY").as[String])
        session
    }
    .pause(3)
    .exec(http("get_broker_config")
      .get("/api/configs/1001?" + serverId)
      .check(status.in(200)))
    .pause(3)
    .exec(http("get_consumer_group_list")
      .get("/api/consumer-groups?" + serverId)
      .check(status.in(200)))
    .pause(500 milliseconds)
    .exec(http("consumer_group_details")
      .get("/api/consumer-group/poczta2-core-kafka-final?" + serverId)
      .check(status.in(200)))

  setUp(scn.inject(atOnceUsers(5))) //model otwarty, 5 uzytkowników na raz
  //setUp(scn.inject(constantUsersPerSec(10) during 60)) //model otwarty, nie kontrolujemy liczby uzytkowników tylko narzucamy, ile ma byc aktwywnych w ciągu sekundy
  //setUp(scn.inject(constantConcurrentUsers(10) during 60)) //model zamknięty, kontrolujemy liczbe uzytkowników
    .protocols(httpProtocol)
    .assertions(global.successfulRequests.percent.is(100)) //asercja po testach
}
