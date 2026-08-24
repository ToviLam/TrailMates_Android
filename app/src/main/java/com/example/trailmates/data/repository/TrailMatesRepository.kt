package com.example.trailmates.data.repository

import com.example.trailmates.data.mock.MockData
import com.example.trailmates.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.time.Instant
import java.util.UUID

class TrailMatesRepository {

    private val _users = MutableStateFlow<List<User>>(MockData.INITIAL_USERS)
    val users: StateFlow<List<User>> = _users.asStateFlow()

    private val _routes = MutableStateFlow<List<Route>>(MockData.INITIAL_ROUTES)
    val routes: StateFlow<List<Route>> = _routes.asStateFlow()

    private val _connections = MutableStateFlow<List<Connection>>(MockData.INITIAL_CONNECTIONS)
    val connections: StateFlow<List<Connection>> = _connections.asStateFlow()

    private val _messages = MutableStateFlow<List<Message>>(MockData.INITIAL_MESSAGES)
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()

    private val _feedItems = MutableStateFlow<List<FeedItem>>(MockData.INITIAL_FEED_ITEMS)
    val feedItems: StateFlow<List<FeedItem>> = _feedItems.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(true)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _currentUserId = MutableStateFlow(MockData.CURRENT_USER_ID)
    val currentUserId: StateFlow<String> = _currentUserId.asStateFlow()

    private val _selectedRouteId = MutableStateFlow<String?>("route-1")
    val selectedRouteId: StateFlow<String?> = _selectedRouteId.asStateFlow()

    private val _activeChatUserId = MutableStateFlow<String?>("user-sierra")
    val activeChatUserId: StateFlow<String?> = _activeChatUserId.asStateFlow()

    private val _activeSession = MutableStateFlow<ActiveWorkoutSession?>(null)
    val activeSession: StateFlow<ActiveWorkoutSession?> = _activeSession.asStateFlow()

    private val _activeSessionSummary = MutableStateFlow<SessionSummary?>(null)
    val activeSessionSummary: StateFlow<SessionSummary?> = _activeSessionSummary.asStateFlow()

    fun getCurrentUser(): User {
        val uid = _currentUserId.value
        return _users.value.find { it.id == uid } ?: MockData.INITIAL_USER_ME
    }

    fun login(email: String) {
        if (email.contains("sierra", ignoreCase = true)) {
            _currentUserId.value = "user-sierra"
        } else {
            _currentUserId.value = MockData.CURRENT_USER_ID
        }
        _isLoggedIn.value = true
    }

    fun register(name: String, email: String) {
        val newUid = "user-${UUID.randomUUID().toString().take(6)}"
        val cleanName = name.ifBlank { "TrailMate" }
        val newUser = User(
            id = newUid,
            name = cleanName,
            fitnessLevel = FitnessLevel.INTERMEDIATE,
            activities = listOf(ActivityType.RUNNING, ActivityType.HIKING),
            isDiscoverable = true,
            currentRouteId = "route-1",
            joinedAt = Instant.now().toString(),
            avatarConfig = AvatarConfig(
                bodyType = "athletic",
                skinTone = "#ffd1b3",
                outfitColor = "#2DD4BF",
                accessory = "headband",
                hairColor = "#4a3728",
                hairStyle = "short",
                displayName = cleanName.replace("\\s+".toRegex(), "").take(15)
            ),
            stats = UserStats(
                totalWorkouts = 0,
                totalDistance = 0.0,
                totalDuration = 0,
                elevationGain = 0
            ),
            bio = "New athlete on TrailMates! Let's explore.",
            location = "Local Trails"
        )
        _users.update { listOf(newUser) + it }
        _currentUserId.value = newUid
        _isLoggedIn.value = true
    }

    fun logout() {
        _isLoggedIn.value = false
    }

    fun updateAvatarConfig(
        config: AvatarConfig,
        fitnessLevel: FitnessLevel,
        activities: List<ActivityType>
    ) {
        val uid = _currentUserId.value
        _users.update { list ->
            list.map { u ->
                if (u.id == uid) {
                    u.copy(
                        avatarConfig = config,
                        fitnessLevel = fitnessLevel,
                        activities = activities
                    )
                } else u
            }
        }
    }

    fun toggleDiscoverable(routeId: String, discoverable: Boolean) {
        val uid = _currentUserId.value
        _users.update { list ->
            list.map { u ->
                if (u.id == uid) {
                    u.copy(
                        isDiscoverable = discoverable,
                        currentRouteId = if (discoverable) routeId else u.currentRouteId
                    )
                } else u
            }
        }
        _routes.update { list ->
            list.map { r ->
                if (r.id == routeId) {
                    val currentUsers = r.discoverableUsers.toMutableList()
                    if (discoverable && !currentUsers.contains(uid)) {
                        currentUsers.add(uid)
                    } else if (!discoverable) {
                        currentUsers.remove(uid)
                    }
                    r.copy(discoverableUsers = currentUsers)
                } else r
            }
        }
    }

    fun selectRoute(routeId: String) {
        _selectedRouteId.value = routeId
        val uid = _currentUserId.value
        _users.update { list ->
            list.map { u ->
                if (u.id == uid) u.copy(currentRouteId = routeId) else u
            }
        }
    }

    fun publishRoute(newRoute: Route, makeDiscoverable: Boolean) {
        val uid = _currentUserId.value
        val routeWithGpx = newRoute.copy(
            gpxPath = if (newRoute.gpxPath.isEmpty()) MockData.generateHighFidelityGpxPath(newRoute.waypoints) else newRoute.gpxPath,
            discoverableUsers = if (makeDiscoverable) listOf(uid) else emptyList()
        )
        _routes.update { listOf(routeWithGpx) + it }
        _selectedRouteId.value = routeWithGpx.id
        if (makeDiscoverable) {
            toggleDiscoverable(routeWithGpx.id, true)
        }
    }

    fun addPhotoToRoute(routeId: String, photo: RoutePhoto) {
        _routes.update { list ->
            list.map { r ->
                if (r.id == routeId) {
                    r.copy(photos = r.photos + photo)
                } else r
            }
        }
    }

    fun toggleLike(feedItemId: String) {
        val uid = _currentUserId.value
        _feedItems.update { list ->
            list.map { item ->
                if (item.id == feedItemId) {
                    val newLikes = if (item.likes.contains(uid)) {
                        item.likes - uid
                    } else {
                        item.likes + uid
                    }
                    item.copy(likes = newLikes)
                } else item
            }
        }
    }

    fun toggleReaction(feedItemId: String, emoji: String) {
        val uid = _currentUserId.value
        _feedItems.update { list ->
            list.map { item ->
                if (item.id == feedItemId) {
                    val currentReactions = item.reactions.toMutableMap()
                    val userList = currentReactions[emoji]?.toMutableList() ?: mutableListOf()
                    if (userList.contains(uid)) {
                        userList.remove(uid)
                    } else {
                        userList.add(uid)
                    }
                    if (userList.isEmpty()) {
                        currentReactions.remove(emoji)
                    } else {
                        currentReactions[emoji] = userList
                    }
                    item.copy(reactions = currentReactions)
                } else item
            }
        }
    }

    fun addComment(feedItemId: String, text: String) {
        if (text.isBlank()) return
        val user = getCurrentUser()
        val comment = FeedComment(
            id = "c-${UUID.randomUUID().toString().take(6)}",
            userId = user.id,
            userName = user.name,
            userAvatarConfig = user.avatarConfig,
            text = text.trim(),
            timestamp = Instant.now().toString()
        )
        _feedItems.update { list ->
            list.map { item ->
                if (item.id == feedItemId) {
                    item.copy(comments = item.comments + comment)
                } else item
            }
        }
    }

    fun addFeedPost(caption: String, routeId: String?, photoUrl: String?) {
        val user = getCurrentUser()
        val route = _routes.value.find { it.id == routeId } ?: _routes.value.first()
        val newPost = FeedItem(
            id = "feed-${UUID.randomUUID().toString().take(6)}",
            userId = user.id,
            type = if (!photoUrl.isNullOrBlank()) "photo_share" else "discoverable",
            userName = user.name,
            userAvatarConfig = user.avatarConfig,
            routeId = route.id,
            routeName = route.name,
            activityType = route.activityType,
            timestamp = Instant.now().toString(),
            caption = caption,
            photoUrl = photoUrl,
            likes = listOf(user.id),
            reactions = mapOf("🔥" to listOf(user.id))
        )
        _feedItems.update { listOf(newPost) + it }
    }

    fun openChat(userId: String) {
        _activeChatUserId.value = userId
        val uid = _currentUserId.value
        val exists = _connections.value.any {
            (it.userIds.first == uid && it.userIds.second == userId) ||
                    (it.userIds.first == userId && it.userIds.second == uid)
        }
        if (!exists) {
            val newConn = Connection(
                id = "conn-${UUID.randomUUID().toString().take(6)}",
                userIds = Pair(uid, userId),
                status = "connected",
                tier = "friend"
            )
            _connections.update { it + newConn }
        }
    }

    fun sendMessage(targetUserId: String, text: String) {
        if (text.isBlank()) return
        val uid = _currentUserId.value
        val conn = _connections.value.find {
            (it.userIds.first == uid && it.userIds.second == targetUserId) ||
                    (it.userIds.first == targetUserId && it.userIds.second == uid)
        } ?: run {
            val newConn = Connection(
                id = "conn-${UUID.randomUUID().toString().take(6)}",
                userIds = Pair(uid, targetUserId),
                status = "connected",
                tier = "friend"
            )
            _connections.update { it + newConn }
            newConn
        }

        val msg = Message(
            id = "m-${UUID.randomUUID().toString().take(6)}",
            connectionId = conn.id,
            senderId = uid,
            text = text.trim(),
            timestamp = Instant.now().toString()
        )
        _messages.update { it + msg }
    }

    fun toggleConnectionStatus(targetUserId: String) {
        val uid = _currentUserId.value
        val existing = _connections.value.find {
            (it.userIds.first == uid && it.userIds.second == targetUserId) ||
                    (it.userIds.first == targetUserId && it.userIds.second == uid)
        }

        if (existing == null) {
            val newConn = Connection(
                id = "conn-${UUID.randomUUID().toString().take(6)}",
                userIds = Pair(uid, targetUserId),
                status = "pending",
                tier = "friend"
            )
            _connections.update { it + newConn }
        } else {
            val nextStatus = when (existing.status) {
                "pending" -> "connected"
                "connected" -> "pending"
                else -> "connected"
            }
            _connections.update { list ->
                list.map { if (it.id == existing.id) it.copy(status = nextStatus) else it }
            }
        }
    }

    fun setConnectionTier(targetUserId: String, tier: String) {
        val uid = _currentUserId.value
        _connections.update { list ->
            list.map { conn ->
                if ((conn.userIds.first == uid && conn.userIds.second == targetUserId) ||
                    (conn.userIds.first == targetUserId && conn.userIds.second == uid)
                ) {
                    conn.copy(tier = tier)
                } else conn
            }
        }
    }

    fun startWorkoutSession(routeId: String, partnerId: String, mode: String) {
        _activeSession.value = ActiveWorkoutSession(routeId, partnerId, mode)
    }

    fun finishWorkoutSession(
        duration: Int,
        distance: Double,
        calories: Int,
        winnerId: String? = null
    ) {
        val session = _activeSession.value ?: return
        val route = _routes.value.find { it.id == session.routeId } ?: _routes.value.first()
        val partner = _users.value.find { it.id == session.partnerId } ?: _users.value.first()
        val user = getCurrentUser()

        val summary = SessionSummary(
            route = route,
            partner = partner,
            duration = duration,
            distance = distance,
            calories = calories,
            winnerId = winnerId
        )
        _activeSessionSummary.value = summary
        _activeSession.value = null

        // Update user stats
        _users.update { list ->
            list.map { u ->
                if (u.id == user.id) {
                    u.copy(
                        stats = u.stats.copy(
                            totalWorkouts = u.stats.totalWorkouts + 1,
                            totalDistance = (u.stats.totalDistance + distance * 10).toInt() / 10.0,
                            totalDuration = u.stats.totalDuration + (duration / 60),
                            elevationGain = u.stats.elevationGain + route.elevation
                        )
                    )
                } else u
            }
        }
    }

    fun shareSummaryToFeed(summary: SessionSummary) {
        val user = getCurrentUser()
        val feedItem = FeedItem(
            id = "feed-${UUID.randomUUID().toString().take(6)}",
            userId = user.id,
            type = "workout",
            userName = user.name,
            userAvatarConfig = user.avatarConfig,
            routeId = summary.route.id,
            routeName = summary.route.name,
            activityType = summary.route.activityType,
            timestamp = Instant.now().toString(),
            workoutStats = WorkoutStatsSummary(
                distance = summary.distance,
                duration = summary.duration / 60,
                elevation = summary.route.elevation
            ),
            caption = if (summary.winnerId == user.id) {
                "🏆 Smashed a competitive session against @${summary.partner.avatarConfig.displayName} on ${summary.route.name}! High pace all the way."
            } else {
                "Completed a great training session with @${summary.partner.avatarConfig.displayName} on ${summary.route.name}! 🔥⛰️"
            },
            likes = listOf(user.id, summary.partner.id),
            reactions = mapOf("🔥" to listOf(user.id, summary.partner.id))
        )
        _feedItems.update { listOf(feedItem) + it }
    }

    fun clearSummary() {
        _activeSessionSummary.value = null
    }
}
