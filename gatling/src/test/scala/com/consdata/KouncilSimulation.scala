package com.consdata

import io.gatling.core.Predef._
import io.gatling.core.structure.ScenarioBuilder
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.concurrent.duration.DurationInt

class KouncilSimulation extends Simulation {

  val headers = Map(
    "Sec-Fetch-Dest" -> "empty",
    "Sec-Fetch-Mode" -> "cors",
    "Sec-Fetch-Site" -> "same-origin",
    "sec-ch-ua" -> """ Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91""",
    "sec-ch-ua-mobile" -> "?0")

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl("http://kouncil.consdata.local")
    .inferHtmlResources(BlackList(), WhiteList())
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7")
    .userAgentHeader("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36")
    .headers(headers)

  val scn: ScenarioBuilder = scenario("KouncilSimulation")
    .exec(http("topic_list")
      .get("/api/topics?serverId=uber_poczta_consdata_local_9092"))
    .pause(3)
    .exec(http("dev_topic_final_first_page")
      .get("/api/topic/messages/dev-topic-final/all/latest?serverId=uber_poczta_consdata_local_9092&offset=0&limit=20"))
    .pause(3)
    .exec(http("broker_list")
      .get("/api/brokers?serverId=uber_poczta_consdata_local_9092"))
    .pause(3)
    .exec(http("broker_config")
      .get("/api/configs/1001?serverId=uber_poczta_consdata_local_9092"))
    .pause(3)
    .exec(http("consumer_group_list")
      .get("/api/consumer-groups?serverId=uber_poczta_consdata_local_9092"))
    .pause(500 milliseconds)
    .exec(http("consumer_group_details")
      .get("/api/consumer-group/poczta2-core-kafka-final?serverId=uber_poczta_consdata_local_9092"))
    .pause(3)
    .exec(http("go_back_to_topic_list")
      .get("/api/topics?serverId=uber_poczta_consdata_local_9092"))

  setUp(scn.inject(atOnceUsers(5))).protocols(httpProtocol)
}
