package com.example.trailmates.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.model.*
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.components.RouteMapCanvas
import com.example.trailmates.ui.theme.*
import kotlinx.coroutines.delay
import kotlin.math.*

@Composable
fun LiveWorkoutScreen(
    session: ActiveWorkoutSession,
    route: Route,
    partner: User,
    currentUser: User,
    onFinishWorkout: (Int, Double, Int, String?) -> Unit,
    onCancelWorkout: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isPaused by remember { mutableStateOf(false) }
    var elapsedSeconds by remember { mutableStateOf(0) }
    var userDistance by remember { mutableStateOf(0.0) }
    var partnerDistance by remember { mutableStateOf(0.0) }
    var userPaceMultiplier by remember { mutableStateOf(1.0) } // For sprint boosts
    var activeCheerMessage by remember { mutableStateOf<String?>(null) }
    var showARCameraMode by remember { mutableStateOf(true) }

    val totalRouteDistance = route.distance.coerceAtLeast(1.0)

    // Dynamic Live Simulation Ticker
    LaunchedEffect(isPaused) {
        while (!isPaused) {
            delay(1000)
            elapsedSeconds++

            // Base user speed ~ 10-12 km/h running or 20 km/h cycling
            val baseSpeedKmh = when (route.activityType) {
                ActivityType.BIKING, ActivityType.MOUNTAIN_BIKING -> 22.0
                ActivityType.SKATEBOARD -> 16.0
                ActivityType.WATER_SPORTS -> 8.0
                else -> 10.5 // Running / Hiking
            }

            val userDeltaKm = (baseSpeedKmh * userPaceMultiplier) / 3600.0
            userDistance = min(totalRouteDistance, userDistance + userDeltaKm)

            // Partner pace simulation based on fitness level and random surges
            val partnerSpeedFactor = when (partner.fitnessLevel) {
                FitnessLevel.ELITE -> 1.15
                FitnessLevel.ADVANCED -> 1.05
                FitnessLevel.INTERMEDIATE -> 0.98
                FitnessLevel.BEGINNER -> 0.85
            }
            val partnerFluctuation = 1.0 + (sin(elapsedSeconds.toDouble() / 6.0) * 0.08)
            val partnerDeltaKm = (baseSpeedKmh * partnerSpeedFactor * partnerFluctuation) / 3600.0
            partnerDistance = min(totalRouteDistance, partnerDistance + partnerDeltaKm)

            // Dynamic Cheer Trigger
            if (elapsedSeconds % 12 == 0) {
                activeCheerMessage = when {
                    userDistance > partnerDistance + 0.05 -> "🔥 You took the lead! Keep the tempo!"
                    partnerDistance > userDistance + 0.05 -> "⚡ ${partner.name} is surging ahead on the climb!"
                    else -> "🙌 Great rhythm! Pacing side-by-side."
                }
            } else if (elapsedSeconds % 12 == 4) {
                activeCheerMessage = null
            }

            // Auto complete if reached finish
            if (userDistance >= totalRouteDistance && partnerDistance >= totalRouteDistance) {
                val calories = (userDistance * 65 + (route.elevation * 0.4)).toInt()
                val winnerId = if (userDistance >= partnerDistance) currentUser.id else partner.id
                onFinishWorkout(elapsedSeconds, userDistance, calories, winnerId)
                break
            }
        }
    }

    val userRatio = (userDistance / totalRouteDistance).toFloat().coerceIn(0f, 1f)
    val partnerRatio = (partnerDistance / totalRouteDistance).toFloat().coerceIn(0f, 1f)
    val distanceGapMeters = ((userDistance - partnerDistance) * 1000).roundToInt()

    val caloriesBurned = (userDistance * 62 + (route.elevation * userRatio * 0.3)).toInt()
    val paceString = remember(elapsedSeconds, userDistance) {
        if (userDistance <= 0.01) "5:30 /km"
        else {
            val paceSec = (elapsedSeconds / userDistance).toInt()
            val m = paceSec / 60
            val s = paceSec % 60
            String.format("%d:%02d /km", m, s)
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgBase
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF0F172A),
                            if (showARCameraMode) Color(0xFF132B25) else Color(0xFF0B1120),
                            Color(0xFF090D16)
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .navigationBarsPadding()
                    .padding(16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // 1. Top HUD Header: Mode Badge + Route Name + AR View Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (session.mode == "compete") BrandOrange.copy(alpha = 0.2f) else BrandGreen.copy(alpha = 0.2f))
                            .border(1.dp, if (session.mode == "compete") BrandOrange else BrandGreen, RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(if (session.mode == "compete") "⚡" else "🤝", fontSize = 12.sp)
                            Text(
                                text = if (session.mode == "compete") "COMPETITIVE RACE" else "WORKOUT TOGETHER",
                                color = if (session.mode == "compete") BrandOrange else BrandGreen,
                                fontWeight = FontWeight.Black,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = { showARCameraMode = !showARCameraMode },
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(SurfaceDark2)
                        ) {
                            Icon(
                                imageVector = if (showARCameraMode) Icons.Filled.Videocam else Icons.Filled.VideocamOff,
                                contentDescription = "AR Camera",
                                tint = BrandGreen
                            )
                        }

                        IconButton(
                            onClick = onCancelWorkout,
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(SurfaceDark2)
                        ) {
                            Icon(Icons.Filled.Close, contentDescription = "Cancel", tint = TextSecondary)
                        }
                    }
                }

                // 2. Ghost Partner Pacing Indicator & Avatars
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark.copy(alpha = 0.9f)),
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            // User Avatar
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                AvatarViewer(
                                    config = currentUser.avatarConfig,
                                    size = 56.dp,
                                    animate = !isPaused,
                                    activityEmoji = route.activityType.emoji
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "YOU (${String.format("%.2f", userDistance)}km)",
                                    color = BrandGreen,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }

                            // Center Distance Delta Badge
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "GAP",
                                    color = TextMuted,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = when {
                                        distanceGapMeters > 0 -> "+${distanceGapMeters}m Ahead"
                                        distanceGapMeters < 0 -> "${distanceGapMeters}m Behind"
                                        else -> "Tied 0m"
                                    },
                                    color = when {
                                        distanceGapMeters > 0 -> BrandGreen
                                        distanceGapMeters < 0 -> BrandOrange
                                        else -> BrandBlue
                                    },
                                    fontWeight = FontWeight.Black,
                                    fontSize = 14.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = route.name,
                                    color = TextSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            // Partner Avatar
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                AvatarViewer(
                                    config = partner.avatarConfig,
                                    size = 56.dp,
                                    animate = !isPaused,
                                    activityEmoji = partner.activities.firstOrNull()?.emoji
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${partner.name.split(" ").first()} (${String.format("%.2f", partnerDistance)}km)",
                                    color = BrandBlue,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        // Animated Dynamic Event Cheer Banner
                        AnimatedVisibility(
                            visible = activeCheerMessage != null,
                            enter = fadeIn() + expandVertically(),
                            exit = fadeOut() + shrinkVertically()
                        ) {
                            activeCheerMessage?.let { msg ->
                                Spacer(modifier = Modifier.height(10.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(BrandGreen.copy(alpha = 0.15f))
                                        .border(1.dp, BrandGreen, RoundedCornerShape(10.dp))
                                        .padding(8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = msg,
                                        color = TextPrimary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // 3. Mini Trail Route Progress Map Canvas
                RouteMapCanvas(
                    route = route,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp),
                    activeProgressRatio = userRatio,
                    partnerProgressRatio = partnerRatio,
                    showElevationProfile = false
                )

                // 4. Primary Live Telemetry Grid (Time, Distance, Pace, Calories)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Main Timer & Progress Bar
                        val mins = elapsedSeconds / 60
                        val secs = elapsedSeconds % 60
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = String.format("%02d:%02d", mins, secs),
                                color = TextPrimary,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )

                            Text(
                                text = "${(userRatio * 100).toInt()}% COMPLETED",
                                color = BrandGreen,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        // Double progress bar (User in Green, Partner in Blue)
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            LinearProgressIndicator(
                                progress = { userRatio },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(4.dp)),
                                color = BrandGreen,
                                trackColor = Color(0xFF0F172A),
                            )
                            LinearProgressIndicator(
                                progress = { partnerRatio },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp)),
                                color = BrandBlue,
                                trackColor = Color(0xFF0F172A),
                            )
                        }

                        // 3 Telemetry Metrics
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            TelemetryBox(label = "DISTANCE", value = "${String.format("%.2f", userDistance)} km", color = BrandGreen)
                            TelemetryBox(label = "LIVE PACE", value = paceString, color = BrandBlue)
                            TelemetryBox(label = "CALORIES", value = "$caloriesBurned kcal", color = BrandAccent)
                        }
                    }
                }

                // 5. Action Controls Row (Sprint Boost, Cheer, Pause, Finish)
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Sprint Boost
                        Button(
                            onClick = {
                                userPaceMultiplier = 1.4
                                activeCheerMessage = "⚡ Sprint Boost Activated! Surging forward!"
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark2),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("⚡ Surge +30%", color = BrandOrange, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }

                        // Send Cheer
                        Button(
                            onClick = {
                                activeCheerMessage = "🙌 Sent an instant high-five cheer to ${partner.name}!"
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark2),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("🙌 High Five", color = BrandGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Pause / Resume
                        Button(
                            onClick = { isPaused = !isPaused },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isPaused) BrandBlue else SurfaceDark2
                            ),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(
                                imageVector = if (isPaused) Icons.Filled.PlayArrow else Icons.Filled.Pause,
                                contentDescription = "Pause",
                                tint = if (isPaused) BgBase else TextPrimary
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isPaused) "Resume" else "Pause",
                                color = if (isPaused) BgBase else TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }

                        // Finish Workout
                        Button(
                            onClick = {
                                val calories = (userDistance * 65 + (route.elevation * 0.4)).toInt()
                                val winnerId = if (userDistance >= partnerDistance) currentUser.id else partner.id
                                onFinishWorkout(elapsedSeconds, userDistance, calories, winnerId)
                            },
                            modifier = Modifier
                                .weight(1.5f)
                                .height(50.dp)
                                .testTag("btn_finish_workout"),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Filled.Flag, contentDescription = "Finish", tint = BgBase)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Finish Session",
                                color = BgBase,
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TelemetryBox(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            fontSize = 9.sp,
            color = TextMuted,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontSize = 15.sp,
            color = color,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace
        )
    }
}
