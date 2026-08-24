package com.example.trailmates

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.trailmates.data.repository.TrailMatesRepository
import com.example.trailmates.ui.components.AppBottomNav
import com.example.trailmates.ui.components.AppScreen
import com.example.trailmates.ui.screens.*
import com.example.trailmates.ui.theme.BgBase
import com.example.trailmates.ui.theme.TrailMatesTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TrailMatesTheme {
                TrailMatesApp()
            }
        }
    }
}

@Composable
fun TrailMatesApp(
    repository: TrailMatesRepository = remember { TrailMatesRepository() }
) {
    val isLoggedIn by repository.isLoggedIn.collectAsStateWithLifecycle()
    val users by repository.users.collectAsStateWithLifecycle()
    val routes by repository.routes.collectAsStateWithLifecycle()
    val connections by repository.connections.collectAsStateWithLifecycle()
    val messages by repository.messages.collectAsStateWithLifecycle()
    val feedItems by repository.feedItems.collectAsStateWithLifecycle()
    val currentUserId by repository.currentUserId.collectAsStateWithLifecycle()
    val selectedRouteId by repository.selectedRouteId.collectAsStateWithLifecycle()
    val activeChatUserId by repository.activeChatUserId.collectAsStateWithLifecycle()
    val activeSession by repository.activeSession.collectAsStateWithLifecycle()
    val activeSessionSummary by repository.activeSessionSummary.collectAsStateWithLifecycle()

    val currentUser = remember(users, currentUserId) {
        users.find { it.id == currentUserId } ?: users.first()
    }

    var currentScreen by remember { mutableStateOf(AppScreen.ROUTES) }
    var isUserGuideOpen by remember { mutableStateOf(false) }
    var isAvatarBuilderOpen by remember { mutableStateOf(false) }
    var isChatOpen by remember { mutableStateOf(false) }

    when {
        !isLoggedIn -> {
            LandingScreen(
                onLogin = { email -> repository.login(email) },
                onRegister = { name, email -> repository.register(name, email) }
            )
        }
        activeSession != null -> {
            val session = activeSession!!
            val route = routes.find { it.id == session.routeId } ?: routes.first()
            val partner = users.find { it.id == session.partnerId } ?: users.first()
            LiveWorkoutScreen(
                session = session,
                route = route,
                partner = partner,
                currentUser = currentUser,
                onFinishWorkout = { duration, distance, calories, winnerId ->
                    repository.finishWorkoutSession(duration, distance, calories, winnerId)
                },
                onCancelWorkout = {
                    repository.finishWorkoutSession(0, 0.0, 0, null)
                }
            )
        }
        activeSessionSummary != null -> {
            val summary = activeSessionSummary!!
            SummaryScreen(
                summary = summary,
                currentUser = currentUser,
                onShareToFeed = {
                    repository.shareSummaryToFeed(summary)
                    repository.clearSummary()
                    currentScreen = AppScreen.FEED
                },
                onClose = {
                    repository.clearSummary()
                    currentScreen = AppScreen.ROUTES
                }
            )
        }
        isUserGuideOpen -> {
            UserGuideScreen(onBack = { isUserGuideOpen = false })
        }
        isAvatarBuilderOpen -> {
            AvatarBuilderScreen(
                initialConfig = currentUser.avatarConfig,
                initialFitnessLevel = currentUser.fitnessLevel,
                initialActivities = currentUser.activities,
                onSave = { config, fitness, activities ->
                    repository.updateAvatarConfig(config, fitness, activities)
                    isAvatarBuilderOpen = false
                },
                onBack = { isAvatarBuilderOpen = false }
            )
        }
        isChatOpen && activeChatUserId != null -> {
            val partner = users.find { it.id == activeChatUserId } ?: users.first()
            ChatScreen(
                partnerUser = partner,
                currentUser = currentUser,
                messages = messages,
                connections = connections,
                routes = routes,
                onSendMessage = { text -> repository.sendMessage(partner.id, text) },
                onStartWorkout = { routeId ->
                    isChatOpen = false
                    repository.startWorkoutSession(routeId, partner.id, "together")
                },
                onBack = { isChatOpen = false }
            )
        }
        else -> {
            Scaffold(
                modifier = Modifier.fillMaxSize(),
                containerColor = BgBase,
                bottomBar = {
                    AppBottomNav(
                        currentScreen = currentScreen,
                        onNavigate = { currentScreen = it }
                    )
                }
            ) { padding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                ) {
                    when (currentScreen) {
                        AppScreen.FEED -> {
                            SocialFeedScreen(
                                feedItems = feedItems,
                                currentUser = currentUser,
                                routes = routes,
                                onToggleLike = { id -> repository.toggleLike(id) },
                                onToggleReaction = { id, emoji -> repository.toggleReaction(id, emoji) },
                                onAddComment = { id, text -> repository.addComment(id, text) },
                                onAddPost = { caption, routeId, photoUrl ->
                                    repository.addFeedPost(caption, routeId, photoUrl)
                                },
                                onSelectRoute = { routeId ->
                                    repository.selectRoute(routeId)
                                    currentScreen = AppScreen.ROUTES
                                }
                            )
                        }
                        AppScreen.ROUTES -> {
                            MapViewScreen(
                                routes = routes,
                                users = users,
                                currentUser = currentUser,
                                selectedRouteId = selectedRouteId,
                                onSelectRoute = { id -> repository.selectRoute(id) },
                                onToggleDiscoverable = { id, disc -> repository.toggleDiscoverable(id, disc) },
                                onStartLiveWorkout = { routeId, partnerId, mode ->
                                    repository.startWorkoutSession(routeId, partnerId, mode)
                                },
                                onOpenChat = { targetUserId ->
                                    repository.openChat(targetUserId)
                                    isChatOpen = true
                                },
                                onAddPhoto = { routeId, photo ->
                                    repository.addPhotoToRoute(routeId, photo)
                                }
                            )
                        }
                        AppScreen.CREATE_ROUTE -> {
                            CreateRouteScreen(
                                onPublishRoute = { newRoute, makeDiscoverable ->
                                    repository.publishRoute(newRoute, makeDiscoverable)
                                    currentScreen = AppScreen.ROUTES
                                }
                            )
                        }
                        AppScreen.PEOPLE -> {
                            PeopleScreen(
                                users = users,
                                currentUser = currentUser,
                                connections = connections,
                                routes = routes,
                                onToggleConnection = { targetId -> repository.toggleConnectionStatus(targetId) },
                                onSetTier = { targetId, tier -> repository.setConnectionTier(targetId, tier) },
                                onOpenChat = { targetId ->
                                    repository.openChat(targetId)
                                    isChatOpen = true
                                },
                                onStartWorkoutWith = { targetId, routeId ->
                                    repository.startWorkoutSession(routeId, targetId, "together")
                                }
                            )
                        }
                        AppScreen.PROFILE -> {
                            ProfileScreen(
                                currentUser = currentUser,
                                onNavigateToAvatarBuilder = { isAvatarBuilderOpen = true },
                                onNavigateToUserGuide = { isUserGuideOpen = true },
                                onLogout = { repository.logout() }
                            )
                        }
                    }
                }
            }
        }
    }
}
