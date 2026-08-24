package com.example.trailmates.data.mock

import com.example.trailmates.data.model.*
import kotlin.math.*

object MockData {
    const val CURRENT_USER_ID = "user-me"

    val INITIAL_USER_ME = User(
        id = CURRENT_USER_ID,
        name = "Tovi Lam",
        fitnessLevel = FitnessLevel.INTERMEDIATE,
        activities = listOf(ActivityType.RUNNING, ActivityType.HIKING),
        isDiscoverable = true,
        currentRouteId = "route-1",
        joinedAt = "2026-01-15T12:00:00Z",
        avatarConfig = AvatarConfig(
            bodyType = "athletic",
            skinTone = "#ffd1b3",
            outfitColor = "#2DD4BF",
            accessory = "headband",
            hairColor = "#4a3728",
            hairStyle = "short",
            displayName = "ToviRunner"
        ),
        stats = UserStats(
            totalWorkouts = 24,
            totalDistance = 138.4,
            totalDuration = 940,
            elevationGain = 1250
        ),
        bio = "Trail runner and weekend mountaineer. Let's pace together!",
        location = "San Francisco, CA"
    )

    val INITIAL_USERS = listOf(
        INITIAL_USER_ME,
        User(
            id = "user-leo",
            name = "Leo 'Apex' Rivers",
            fitnessLevel = FitnessLevel.ELITE,
            activities = listOf(ActivityType.BIKING, ActivityType.MOUNTAIN_BIKING),
            isDiscoverable = true,
            currentRouteId = "route-3",
            joinedAt = "2025-11-20T10:30:00Z",
            avatarConfig = AvatarConfig(
                bodyType = "muscular",
                skinTone = "#d2a172",
                outfitColor = "#38BDF8",
                accessory = "helmet",
                hairColor = "#1a1a1a",
                hairStyle = "none",
                displayName = "LeoApex"
            ),
            stats = UserStats(
                totalWorkouts = 112,
                totalDistance = 2150.5,
                totalDuration = 6480,
                elevationGain = 18400
            ),
            bio = "Downhill speed and KOM hunter. Race me on the climbs!",
            location = "Boulder, CO"
        ),
        User(
            id = "user-sierra",
            name = "Sierra Peak",
            fitnessLevel = FitnessLevel.ADVANCED,
            activities = listOf(ActivityType.HIKING, ActivityType.RUNNING),
            isDiscoverable = true,
            currentRouteId = "route-1",
            joinedAt = "2026-02-01T08:15:00Z",
            avatarConfig = AvatarConfig(
                bodyType = "slim",
                skinTone = "#ffd1b3",
                outfitColor = "#f97316",
                accessory = "cap",
                hairColor = "#d97706",
                hairStyle = "long",
                displayName = "SierraSummit"
            ),
            stats = UserStats(
                totalWorkouts = 45,
                totalDistance = 320.8,
                totalDuration = 2100,
                elevationGain = 4850
            ),
            bio = "Peak bagger & ultra-trail lover. Early mornings are best.",
            location = "Vancouver, BC"
        ),
        User(
            id = "user-jax",
            name = "Jax Rider",
            fitnessLevel = FitnessLevel.INTERMEDIATE,
            activities = listOf(ActivityType.SKATEBOARD),
            isDiscoverable = true,
            currentRouteId = "route-5",
            joinedAt = "2026-03-10T14:20:00Z",
            avatarConfig = AvatarConfig(
                bodyType = "average",
                skinTone = "#8c5a3c",
                outfitColor = "#6366f1",
                accessory = "sunglasses",
                hairColor = "#4b5563",
                hairStyle = "curly",
                displayName = "JaxGlide"
            ),
            stats = UserStats(
                totalWorkouts = 19,
                totalDistance = 68.2,
                totalDuration = 410,
                elevationGain = 120
            ),
            bio = "Cruising coastal boardwalks and finding smooth lines.",
            location = "Venice Beach, CA"
        ),
        User(
            id = "user-marina",
            name = "Marina Swift",
            fitnessLevel = FitnessLevel.ADVANCED,
            activities = listOf(ActivityType.WATER_SPORTS, ActivityType.RUNNING),
            isDiscoverable = true,
            currentRouteId = "route-6",
            joinedAt = "2026-02-28T09:40:00Z",
            avatarConfig = AvatarConfig(
                bodyType = "athletic",
                skinTone = "#ffd1b3",
                outfitColor = "#06b6d4",
                accessory = "headband",
                hairColor = "#fcd34d",
                hairStyle = "long",
                displayName = "WaterMarina"
            ),
            stats = UserStats(
                totalWorkouts = 38,
                totalDistance = 204.5,
                totalDuration = 1320,
                elevationGain = 340
            ),
            bio = "Kayak paddler and harbor runner. Catch me on the water.",
            location = "Hong Kong"
        ),
        User(
            id = "user-cody",
            name = "Cody Trailblazer",
            fitnessLevel = FitnessLevel.INTERMEDIATE,
            activities = listOf(ActivityType.HIKING, ActivityType.MOUNTAIN_BIKING),
            isDiscoverable = true,
            currentRouteId = "route-4",
            joinedAt = "2025-12-05T16:50:00Z",
            avatarConfig = AvatarConfig(
                bodyType = "average",
                skinTone = "#512a18",
                outfitColor = "#A3E635",
                accessory = "helmet",
                hairColor = "#1a1a1a",
                hairStyle = "short",
                displayName = "CodyWild"
            ),
            stats = UserStats(
                totalWorkouts = 58,
                totalDistance = 450.2,
                totalDuration = 3420,
                elevationGain = 6100
            ),
            bio = "Exploring backcountry routes and forest single tracks.",
            location = "Portland, OR"
        ),
        User(
            id = "user-zoe",
            name = "Zoe Pace",
            fitnessLevel = FitnessLevel.INTERMEDIATE,
            activities = listOf(ActivityType.RUNNING, ActivityType.BIKING),
            isDiscoverable = true,
            currentRouteId = "route-8",
            joinedAt = "2026-04-12T11:10:00Z",
            avatarConfig = AvatarConfig(
                bodyType = "slim",
                skinTone = "#ffd1b3",
                outfitColor = "#F472B6",
                accessory = "sunglasses",
                hairColor = "#ec4899",
                hairStyle = "curly",
                displayName = "ZoePaceMaker"
            ),
            stats = UserStats(
                totalWorkouts = 12,
                totalDistance = 48.0,
                totalDuration = 310,
                elevationGain = 280
            ),
            bio = "Sub-25 5k runner & tempo trainer. Let's do intervals!",
            location = "Seattle, WA"
        )
    )

    fun generateHighFidelityGpxPath(waypoints: List<Waypoint>): List<Waypoint> {
        if (waypoints.size < 2) return waypoints
        val result = mutableListOf<Waypoint>()
        val segmentPointsCount = 15

        for (i in 0 until waypoints.size - 1) {
            val start = waypoints[i]
            val end = waypoints[i + 1]

            for (j in 0 until segmentPointsCount) {
                val t = j.toDouble() / segmentPointsCount
                val cosT = (1.0 - cos(t * PI)) / 2.0
                var lat = start.lat + (end.lat - start.lat) * cosT
                var lng = start.lng + (end.lng - start.lng) * cosT
                val ele = start.ele + ((end.ele - start.ele) * cosT).toInt()

                val windingOffsetScale = 0.0012
                val windingFreq = 2.0
                val angle = atan2(end.lat - start.lat, end.lng - start.lng)
                val perpAngle = angle + PI / 2.0
                val bend = sin(t * windingFreq * PI) * windingOffsetScale
                lat += sin(perpAngle) * bend
                lng += cos(perpAngle) * bend

                result.add(
                    Waypoint(
                        lat = lat,
                        lng = lng,
                        ele = max(0, ele),
                        label = if (j == 0) start.label else null
                    )
                )
            }
        }
        result.add(waypoints.last())
        return result
    }

    val INITIAL_ROUTES: List<Route> = listOf(
        Route(
            id = "route-1",
            name = "Emerald Ridge Crest",
            activityType = ActivityType.HIKING,
            distance = 8.4,
            difficulty = "moderate",
            elevation = 420,
            waypoints = listOf(
                Waypoint(37.8267, -122.4828, 120, label = "Trailhead Parking"),
                Waypoint(37.8315, -122.4785, 230, label = "Pine Tree Rest"),
                Waypoint(37.8380, -122.4710, 310, label = "Coyote Pass Lookout"),
                Waypoint(37.8420, -122.4650, 380, label = "Granite Ridge"),
                Waypoint(37.8450, -122.4580, 420, label = "The Emerald Summit")
            ),
            discoverableUsers = listOf("user-sierra", CURRENT_USER_ID),
            startPointName = "Canyon View Gateway",
            endPointName = "Emerald Summit Vista",
            region = "USA",
            photos = listOf(
                RoutePhoto("https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80", 1),
                RoutePhoto("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80", 3)
            )
        ),
        Route(
            id = "route-2",
            name = "Downtown Riverwalk Loop",
            activityType = ActivityType.RUNNING,
            distance = 5.0,
            difficulty = "easy",
            elevation = 15,
            waypoints = listOf(
                Waypoint(37.7885, -122.4000, 5, label = "Bridge Plaza"),
                Waypoint(37.7920, -122.3950, 8, label = "Waterfront Amphitheater"),
                Waypoint(37.7960, -122.3920, 10, label = "Marina Café"),
                Waypoint(37.8000, -122.3980, 12, label = "Eastside Footbridge"),
                Waypoint(37.7940, -122.4050, 7, label = "South Promenade")
            ),
            discoverableUsers = listOf("user-zoe"),
            startPointName = "City Bridge North",
            endPointName = "City Bridge South",
            region = "USA",
            photos = listOf(
                RoutePhoto("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80", 2)
            )
        ),
        Route(
            id = "route-3",
            name = "Overlook Skyline Trail",
            activityType = ActivityType.BIKING,
            distance = 15.2,
            difficulty = "hard",
            elevation = 680,
            waypoints = listOf(
                Waypoint(37.8100, -122.4900, 150, label = "Foothill Station"),
                Waypoint(37.8200, -122.4800, 320, label = "Valley Windmill"),
                Waypoint(37.8350, -122.4700, 490, label = "Eagle Nest Overlook"),
                Waypoint(37.8480, -122.4600, 610, label = "Cloud Forest Stop"),
                Waypoint(37.8550, -122.4500, 680, label = "Skyline Hub")
            ),
            discoverableUsers = listOf("user-leo"),
            startPointName = "Valley Base Depot",
            endPointName = "Skyline Ridge Observatory",
            region = "USA"
        ),
        Route(
            id = "route-4",
            name = "Redwood Canyon Run",
            activityType = ActivityType.HIKING,
            distance = 6.2,
            difficulty = "moderate",
            elevation = 180,
            waypoints = listOf(
                Waypoint(37.8150, -122.4600, 80, label = "Cathedral Grove"),
                Waypoint(37.8220, -122.4520, 120, label = "Fern Creek Crossing"),
                Waypoint(37.8280, -122.4480, 160, label = "Giant Sentinel"),
                Waypoint(37.8340, -122.4420, 180, label = "Whispering Canopy")
            ),
            discoverableUsers = listOf("user-cody"),
            startPointName = "Fern Valley Trailhead",
            endPointName = "Deep Forest Grove",
            region = "USA"
        ),
        Route(
            id = "route-5",
            name = "Asphalt Waves Skatepath",
            activityType = ActivityType.SKATEBOARD,
            distance = 3.5,
            difficulty = "easy",
            elevation = 10,
            waypoints = listOf(
                Waypoint(37.7700, -122.5100, 5, label = "West Skate Park"),
                Waypoint(37.7740, -122.5020, 8, label = "The Curved Rail"),
                Waypoint(37.7780, -122.4950, 10, label = "Sunset Plaza"),
                Waypoint(37.7820, -122.4880, 7, label = "Ocean Promenade"),
                Waypoint(37.7860, -122.4810, 6, label = "East Bowl Vista")
            ),
            discoverableUsers = listOf("user-jax"),
            startPointName = "West Coast Skatepark",
            endPointName = "Pier Promenade Coast",
            region = "USA"
        ),
        Route(
            id = "route-6",
            name = "Bay Breeze Kayak Crossing",
            activityType = ActivityType.WATER_SPORTS,
            distance = 4.2,
            difficulty = "moderate",
            elevation = 0,
            waypoints = listOf(
                Waypoint(37.8050, -122.4300, 0, label = "South Shore Launch"),
                Waypoint(37.8150, -122.4200, 0, label = "Mid-Bay Buoy 4"),
                Waypoint(37.8220, -122.4150, 0, label = "Gull Island Shallows"),
                Waypoint(37.8290, -122.4100, 0, label = "North Bay Cove")
            ),
            discoverableUsers = listOf("user-marina"),
            startPointName = "South Pier Beach",
            endPointName = "North Cove Sands",
            region = "USA"
        ),
        Route(
            id = "hk-dragons-back",
            name = "Dragon's Back Ridge Walk",
            activityType = ActivityType.HIKING,
            distance = 8.5,
            difficulty = "moderate",
            elevation = 320,
            waypoints = listOf(
                Waypoint(22.2268, 114.2402, 80, label = "Shek O Road Trailhead"),
                Waypoint(22.2338, 114.2435, 284, label = "Shek O Peak Viewpoint"),
                Waypoint(22.2410, 114.2452, 320, label = "Dragon's Back Ridge Peak"),
                Waypoint(22.2495, 114.2481, 150, label = "Pottinger Peak Gap Wood"),
                Waypoint(22.2592, 114.2496, 5, label = "Big Wave Bay Beach Finisher")
            ),
            discoverableUsers = emptyList(),
            startPointName = "Shek O Road Trailhead",
            endPointName = "Big Wave Bay Sandy Beach",
            region = "Hong Kong"
        ),
        Route(
            id = "hk-taimoshan-cycling",
            name = "Tai Mo Shan Road Bike Ascent",
            activityType = ActivityType.BIKING,
            distance = 11.2,
            difficulty = "expert",
            elevation = 910,
            waypoints = listOf(
                Waypoint(22.3831, 114.1145, 150, label = "Tsuen Kam Highway Junction"),
                Waypoint(22.4048, 114.1088, 490, label = "Country Park Visitor Centre"),
                Waypoint(22.4075, 114.1165, 640, label = "Tai Mo Shan Scenic Lookout"),
                Waypoint(22.4112, 114.1232, 820, label = "Upper Gated Mountain Path"),
                Waypoint(22.4118, 114.1238, 957, label = "Weather Radar Summit Gate")
            ),
            discoverableUsers = emptyList(),
            startPointName = "Tsuen Wan Base",
            endPointName = "Tai Mo Shan Radar Summit",
            region = "Hong Kong"
        ),
        Route(
            id = "ca-lake-louise",
            name = "Plain of Six Glaciers Trail",
            activityType = ActivityType.HIKING,
            distance = 12.0,
            difficulty = "moderate",
            elevation = 380,
            waypoints = listOf(
                Waypoint(51.4174, -116.1772, 1731, label = "Lake Louise Chateau Pier"),
                Waypoint(51.4115, -116.1965, 1735, label = "Lake Louise Delta Flats"),
                Waypoint(51.4018, -116.2132, 1980, label = "Plain of Six Glaciers Moraine"),
                Waypoint(51.3925, -116.2215, 2100, label = "Plain of Six Glaciers Teahouse"),
                Waypoint(51.3888, -116.2285, 2240, label = "Glacial Scree Lookout Finisher")
            ),
            discoverableUsers = emptyList(),
            startPointName = "Lake Louise Shoreline Pier",
            endPointName = "Plain of Six Glaciers Teahouse",
            region = "Canada"
        ),
        Route(
            id = "ca-stanley-seawall",
            name = "Stanley Park Seawall Loop",
            activityType = ActivityType.RUNNING,
            distance = 9.8,
            difficulty = "easy",
            elevation = 15,
            waypoints = listOf(
                Waypoint(49.2905, -123.1325, 3, label = "Coal Harbour Entry Arch"),
                Waypoint(49.3015, -123.1205, 5, label = "Brockton Point Light House"),
                Waypoint(49.3142, -123.1395, 4, label = "Siwash Rock Scenic Lookout"),
                Waypoint(49.3075, -123.1535, 3, label = "Third Beach Bay Boardwalk"),
                Waypoint(49.2862, -123.1432, 2, label = "English Bay Beach")
            ),
            discoverableUsers = emptyList(),
            startPointName = "Coal Harbour Entry",
            endPointName = "English Bay Beach Sand",
            region = "Canada"
        ),
        Route(
            id = "ca-whistler-aline",
            name = "Whistler Gravity Downhill: A-Line",
            activityType = ActivityType.MOUNTAIN_BIKING,
            distance = 3.5,
            difficulty = "hard",
            elevation = 450,
            waypoints = listOf(
                Waypoint(50.1135, -122.9525, 1120, label = "Fitzsimmons Chairdrop Gate"),
                Waypoint(50.1158, -122.9548, 940, label = "Rollercoaster Berms Track"),
                Waypoint(50.1185, -122.9562, 810, label = "A-Line Tombstone Great Jump"),
                Waypoint(50.1208, -122.9535, 710, label = "GLC Drop Spectator Arena"),
                Waypoint(50.1215, -122.9495, 670, label = "Whistler Village Plaza")
            ),
            discoverableUsers = emptyList(),
            startPointName = "Fitzsimmons Chairlift Top",
            endPointName = "Whistler Village Plaza Base",
            region = "Canada"
        )
    ).map { route ->
        route.copy(gpxPath = generateHighFidelityGpxPath(route.waypoints))
    }

    val INITIAL_CONNECTIONS = listOf(
        Connection("conn-sierra", Pair(CURRENT_USER_ID, "user-sierra"), "connected", "friend"),
        Connection("conn-leo", Pair(CURRENT_USER_ID, "user-leo"), "connected", "challenger"),
        Connection("conn-marina", Pair(CURRENT_USER_ID, "user-marina"), "pending", "friend"),
        Connection("conn-cody", Pair(CURRENT_USER_ID, "user-cody"), "pending", "friend")
    )

    val INITIAL_MESSAGES = listOf(
        Message(
            id = "m1",
            connectionId = "conn-sierra",
            senderId = "user-sierra",
            text = "Hey! I see you're discoverable on Emerald Ridge Crest today. Going hiking?",
            timestamp = "2026-06-25T08:00:00Z"
        ),
        Message(
            id = "m2",
            connectionId = "conn-sierra",
            senderId = CURRENT_USER_ID,
            text = "Yes! Hoping to catch the summit view. What's your pace looking like?",
            timestamp = "2026-06-25T08:02:00Z"
        ),
        Message(
            id = "m3",
            connectionId = "conn-sierra",
            senderId = "user-sierra",
            text = "Moderate pace! Happy to do a joint AR workout. Let's do a challenge or a friendly run!",
            timestamp = "2026-06-25T08:04:00Z"
        ),
        Message(
            id = "m4",
            connectionId = "conn-leo",
            senderId = "user-leo",
            text = "Hey man, doing Skyline Ridge later, you down for a speed run?",
            timestamp = "2026-06-24T18:12:00Z"
        )
    )

    val INITIAL_FEED_ITEMS = listOf(
        FeedItem(
            id = "feed-1",
            userId = "user-leo",
            type = "workout",
            userName = "Leo 'Apex' Rivers",
            userAvatarConfig = AvatarConfig(
                bodyType = "muscular",
                skinTone = "#d2a172",
                outfitColor = "#38BDF8",
                accessory = "helmet",
                hairColor = "#1a1a1a",
                hairStyle = "none",
                displayName = "LeoApex"
            ),
            routeId = "hk-taimoshan-cycling",
            routeName = "Tai Mo Shan Road Bike Ascent",
            activityType = ActivityType.BIKING,
            timestamp = "2026-06-25T16:20:00Z",
            likes = listOf("user-sierra", "user-jax", CURRENT_USER_ID),
            reactions = mapOf(
                "🔥" to listOf("user-sierra", "user-jax", CURRENT_USER_ID),
                "🙌" to listOf("user-marina")
            ),
            workoutStats = WorkoutStatsSummary(
                distance = 11.2,
                duration = 48,
                elevation = 910
            ),
            caption = "Smashed the climb today! The legs were screaming on the final segment past the radar gate but managed a new PR. Who's challenging this time next week? 🚴‍♂️⛰️🔋",
            comments = listOf(
                FeedComment(
                    id = "c-1",
                    userId = "user-sierra",
                    userName = "Sierra Peak",
                    userAvatarConfig = AvatarConfig(
                        bodyType = "slim",
                        skinTone = "#ffd1b3",
                        outfitColor = "#f97316",
                        accessory = "cap",
                        hairColor = "#d97706",
                        hairStyle = "long",
                        displayName = "SierraSummit"
                    ),
                    text = "Incredible climb rate, Leo! That elevation change is no joke.",
                    timestamp = "2026-06-25T16:35:00Z"
                ),
                FeedComment(
                    id = "c-2",
                    userId = "user-jax",
                    userName = "Jax Rider",
                    userAvatarConfig = AvatarConfig(
                        bodyType = "average",
                        skinTone = "#8c5a3c",
                        outfitColor = "#6366f1",
                        accessory = "sunglasses",
                        hairColor = "#4b5563",
                        hairStyle = "curly",
                        displayName = "JaxGlide"
                    ),
                    text = "Pure power! ⚡",
                    timestamp = "2026-06-25T16:40:00Z"
                )
            )
        ),
        FeedItem(
            id = "feed-2",
            userId = "user-sierra",
            type = "discoverable",
            userName = "Sierra Peak",
            userAvatarConfig = AvatarConfig(
                bodyType = "slim",
                skinTone = "#ffd1b3",
                outfitColor = "#f97316",
                accessory = "cap",
                hairColor = "#d97706",
                hairStyle = "long",
                displayName = "SierraSummit"
            ),
            routeId = "ca-lake-louise",
            routeName = "Plain of Six Glaciers Trail",
            activityType = ActivityType.HIKING,
            timestamp = "2026-06-25T15:00:00Z",
            likes = listOf(CURRENT_USER_ID),
            reactions = mapOf(
                "❤️" to listOf(CURRENT_USER_ID, "user-marina"),
                "✨" to listOf("user-cody")
            ),
            caption = "Sierra Peak is hitting Plain of Six Glaciers Trail now! Beautiful morning for a mountain trek. Anyone down for a dual session or friendly challenge? 🏔️🚶‍♀️",
            comments = listOf(
                FeedComment(
                    id = "c-3",
                    userId = CURRENT_USER_ID,
                    userName = "Tovi Lam",
                    userAvatarConfig = AvatarConfig(
                        bodyType = "athletic",
                        skinTone = "#ffd1b3",
                        outfitColor = "#2DD4BF",
                        accessory = "headband",
                        hairColor = "#4a3728",
                        hairStyle = "short",
                        displayName = "ToviRunner"
                    ),
                    text = "Stunning spot, wish I could join live! Go get it!",
                    timestamp = "2026-06-25T15:15:00Z"
                )
            )
        ),
        FeedItem(
            id = "feed-3",
            userId = "user-marina",
            type = "photo_share",
            userName = "Marina Swift",
            userAvatarConfig = AvatarConfig(
                bodyType = "athletic",
                skinTone = "#ffd1b3",
                outfitColor = "#06b6d4",
                accessory = "headband",
                hairColor = "#fcd34d",
                hairStyle = "long",
                displayName = "WaterMarina"
            ),
            routeId = "hk-stanley-sup",
            routeName = "Stanley Bay Paddleboard Loop",
            activityType = ActivityType.WATER_SPORTS,
            timestamp = "2026-06-25T07:10:00Z",
            likes = listOf(CURRENT_USER_ID, "user-leo", "user-jax"),
            reactions = mapOf(
                "❤️" to listOf(CURRENT_USER_ID, "user-leo", "user-jax"),
                "🙌" to listOf("user-sierra")
            ),
            photoUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
            caption = "Stunning glass water at Stanley Main Beach before my paddleboard session! Zero wind and absolute peace. 🌅🏄‍♀️",
            comments = emptyList()
        ),
        FeedItem(
            id = "feed-4",
            userId = "user-jax",
            type = "workout",
            userName = "Jax Rider",
            userAvatarConfig = AvatarConfig(
                bodyType = "average",
                skinTone = "#8c5a3c",
                outfitColor = "#6366f1",
                accessory = "sunglasses",
                hairColor = "#4b5563",
                hairStyle = "curly",
                displayName = "JaxGlide"
            ),
            routeId = "hk-maonshan-skate",
            routeName = "Ma On Shan Waterfront Skatepath",
            activityType = ActivityType.SKATEBOARD,
            timestamp = "2026-06-24T18:45:00Z",
            likes = listOf("user-marina", CURRENT_USER_ID),
            reactions = mapOf(
                "🤙" to listOf("user-marina", CURRENT_USER_ID),
                "⚡" to listOf("user-leo")
            ),
            workoutStats = WorkoutStatsSummary(
                distance = 4.8,
                duration = 25,
                elevation = 5
            ),
            caption = "Waterfront cruise. Perfect cool breeze for skating tonight. 🛹🌊🌉",
            comments = listOf(
                FeedComment(
                    id = "c-4",
                    userId = "user-marina",
                    userName = "Marina Swift",
                    userAvatarConfig = AvatarConfig(
                        bodyType = "athletic",
                        skinTone = "#ffd1b3",
                        outfitColor = "#06b6d4",
                        accessory = "headband",
                        hairColor = "#fcd34d",
                        hairStyle = "long",
                        displayName = "WaterMarina"
                    ),
                    text = "That path looks so smooth! Let's cross paths next time.",
                    timestamp = "2026-06-24T19:00:00Z"
                )
            )
        )
    )
}
