package com.example.trailmates.data.model

enum class ActivityType(
    val id: String,
    val label: String,
    val emoji: String
) {
    RUNNING("running", "Running", "🏃"),
    HIKING("hiking", "Hiking", "🥾"),
    BIKING("biking", "Biking", "🚴"),
    MOUNTAIN_BIKING("mountain_biking", "Mountain Biking", "🚵"),
    SKATEBOARD("skateboard", "Skateboarding", "🛹"),
    WATER_SPORTS("water_sports", "Water Sports", "🛶");

    companion object {
        fun fromId(id: String): ActivityType = entries.find { it.id == id } ?: RUNNING
    }
}

enum class FitnessLevel(
    val id: String,
    val label: String,
    val description: String
) {
    BEGINNER("beginner", "Beginner (Recreational)", "Focuses on building raw endurance. Walks, light jogs, or fun rides."),
    INTERMEDIATE("intermediate", "Intermediate (Active Train)", "Consistent athlete. Comfortable runs or hilly pacer sessions."),
    ADVANCED("advanced", "Advanced (Competitive)", "Trains regularly. Handles vertical climbs, technical paths, and high paces."),
    ELITE("elite", "Elite (Racer)", "Peak athletic capacity. High tempos, ultra marathons, and extreme gradients.");

    companion object {
        fun fromId(id: String): FitnessLevel = entries.find { it.id == id } ?: INTERMEDIATE
    }
}

data class AvatarConfig(
    val bodyType: String = "athletic", // "slim", "athletic", "muscular", "average"
    val skinTone: String = "#ffd1b3", // Hex color
    val outfitColor: String = "#2DD4BF", // Hex color
    val accessory: String = "none", // "none", "helmet", "cap", "sunglasses", "headband"
    val hairColor: String = "#4a3728", // Hex color
    val hairStyle: String = "short", // "none", "short", "long", "curly"
    val displayName: String = "TrailMate"
)

data class UserStats(
    val totalWorkouts: Int = 0,
    val totalDistance: Double = 0.0, // km
    val totalDuration: Int = 0, // mins
    val elevationGain: Int = 0 // meters
)

data class PrivacySettings(
    val showStatsToChallengers: Boolean = true,
    val defaultPostAudience: String = "public", // "friends", "public"
    val bioPrivate: Boolean = false,
    val agePrivate: Boolean = false,
    val locationPrivate: Boolean = false
)

data class User(
    val id: String,
    val name: String,
    val avatarConfig: AvatarConfig,
    val activities: List<ActivityType>,
    val fitnessLevel: FitnessLevel,
    val currentRouteId: String? = null,
    val isDiscoverable: Boolean = true,
    val avatarUrl: String? = null,
    val joinedAt: String = "2026-01-01T00:00:00Z",
    val stats: UserStats = UserStats(),
    val bio: String? = null,
    val age: Int? = null,
    val location: String? = null,
    val privacySettings: PrivacySettings = PrivacySettings()
)

data class Waypoint(
    val lat: Double,
    val lng: Double,
    val ele: Int = 100, // meters
    val time: String? = null,
    val label: String? = null
)

data class RoutePhoto(
    val url: String,
    val waypointIndex: Int
)

data class Route(
    val id: String,
    val name: String,
    val activityType: ActivityType,
    val distance: Double, // km
    val difficulty: String, // "easy", "moderate", "hard", "expert"
    val elevation: Int, // meters
    val waypoints: List<Waypoint>,
    val discoverableUsers: List<String> = emptyList(),
    val startPointName: String,
    val endPointName: String,
    val photos: List<RoutePhoto> = emptyList(),
    val region: String = "USA",
    val gpxPath: List<Waypoint> = emptyList()
)

data class Connection(
    val id: String,
    val userIds: Pair<String, String>,
    val status: String, // "pending", "connected", "rejected", "blocked"
    val tier: String = "friend", // "challenger", "friend"
    val blockedBy: String? = null
)

data class Message(
    val id: String,
    val connectionId: String,
    val senderId: String,
    val text: String,
    val timestamp: String
)

data class FeedComment(
    val id: String,
    val userId: String,
    val userName: String,
    val userAvatarConfig: AvatarConfig,
    val text: String,
    val timestamp: String
)

data class FeedItem(
    val id: String,
    val userId: String,
    val type: String, // "workout", "discoverable", "photo_share"
    val userName: String,
    val userAvatarConfig: AvatarConfig,
    val routeId: String,
    val routeName: String,
    val activityType: ActivityType,
    val timestamp: String,
    val likes: List<String> = emptyList(),
    val reactions: Map<String, List<String>> = emptyMap(),
    val comments: List<FeedComment> = emptyList(),
    val workoutStats: WorkoutStatsSummary? = null,
    val photoUrl: String? = null,
    val caption: String? = null,
    val audience: String = "public"
)

data class WorkoutStatsSummary(
    val distance: Double,
    val duration: Int, // mins
    val elevation: Int
)

data class SessionStats(
    val elapsedTime: Int = 0, // seconds
    val distanceCompleted: Double = 0.0, // km
    val currentPace: String = "5:15 /km",
    val caloriesBurned: Int = 0
)

data class ActiveWorkoutSession(
    val routeId: String,
    val partnerId: String,
    val mode: String // "compete", "together"
)

data class SessionSummary(
    val route: Route,
    val partner: User,
    val duration: Int, // seconds
    val distance: Double, // km
    val calories: Int,
    val winnerId: String? = null
)
