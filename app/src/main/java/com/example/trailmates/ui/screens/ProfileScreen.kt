package com.example.trailmates.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.example.trailmates.data.model.User
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.theme.*

@Composable
fun ProfileScreen(
    currentUser: User,
    onNavigateToAvatarBuilder: () -> Unit,
    onNavigateToUserGuide: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showStatsToChallengers by remember { mutableStateOf(currentUser.privacySettings.showStatsToChallengers) }
    var privateBio by remember { mutableStateOf(currentUser.privacySettings.bioPrivate) }

    val scrollState = rememberScrollState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgBase,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BgBase)
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "ATHLETE PROFILE",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Lifetime stats, gear setup & privacy controls",
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero Profile Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(22.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    AvatarViewer(
                        config = currentUser.avatarConfig,
                        size = 90.dp,
                        animate = true,
                        activityEmoji = currentUser.activities.firstOrNull()?.emoji
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = currentUser.name,
                        color = TextPrimary,
                        fontWeight = FontWeight.Black,
                        fontSize = 18.sp
                    )

                    Text(
                        text = "@${currentUser.avatarConfig.displayName} • ${currentUser.location ?: "Local Trails"}",
                        color = BrandGreen,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )

                    if (!currentUser.bio.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = currentUser.bio,
                            color = TextSecondary,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Edit Avatar Button
                    Button(
                        onClick = onNavigateToAvatarBuilder,
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark2),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BrandGreen),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("btn_edit_avatar")
                    ) {
                        Icon(Icons.Filled.Tune, contentDescription = "Edit Avatar", tint = BrandGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Customize Persona & Gear", color = BrandGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // Lifetime Stats Panel
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "LIFETIME WORKOUT METRICS",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        ProfileStatItem(label = "WORKOUTS", value = "${currentUser.stats.totalWorkouts}", color = BrandGreen)
                        ProfileStatItem(label = "DISTANCE", value = "${currentUser.stats.totalDistance} km", color = BrandBlue)
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Divider(color = SurfaceBorder, thickness = 1.dp)
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        val hours = currentUser.stats.totalDuration / 60
                        val mins = currentUser.stats.totalDuration % 60
                        ProfileStatItem(label = "TOTAL TIME", value = "${hours}h ${mins}m", color = BrandAccent)
                        ProfileStatItem(label = "ELEVATION", value = "+${currentUser.stats.elevationGain}m", color = BrandPop)
                    }
                }
            }

            // Preferred Disciplines & Tier
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "ATHLETIC CLASSIFICATION",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceDark2)
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Fitness Level", color = TextSecondary, fontSize = 12.sp)
                        Text(
                            currentUser.fitnessLevel.label,
                            color = BrandGreen,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceDark2)
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Activities", color = TextSecondary, fontSize = 12.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            currentUser.activities.forEach { act ->
                                Text("${act.emoji} ${act.label}", color = TextPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }

            // Privacy & Settings
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "PRIVACY & SECURITY",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Show Stats to Challengers", color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text("Allow race partners to view pace comparison", color = TextMuted, fontSize = 10.sp)
                        }
                        Switch(
                            checked = showStatsToChallengers,
                            onCheckedChange = { showStatsToChallengers = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = BrandGreen, checkedTrackColor = BrandGreen.copy(alpha = 0.3f))
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Private Bio & Location", color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text("Only mutual friends can see personal details", color = TextMuted, fontSize = 10.sp)
                        }
                        Switch(
                            checked = privateBio,
                            onCheckedChange = { privateBio = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = BrandGreen, checkedTrackColor = BrandGreen.copy(alpha = 0.3f))
                        )
                    }
                }
            }

            // User Guide & Help
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToUserGuide() },
                colors = CardDefaults.cardColors(containerColor = SurfaceDark2),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BrandBlue.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("📖", fontSize = 20.sp)
                        Column {
                            Text("TrailMates User Guide", color = BrandBlue, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Learn about AR workouts, routes & challenger tiers", color = TextMuted, fontSize = 11.sp)
                        }
                    }
                    Icon(Icons.Filled.ChevronRight, contentDescription = "Open Guide", tint = BrandBlue)
                }
            }

            // Logout Button
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("btn_logout"),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = DangerRed),
                border = androidx.compose.foundation.BorderStroke(1.dp, DangerRed),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Filled.Logout, contentDescription = "Logout", tint = DangerRed, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Log Out", color = DangerRed, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ProfileStatItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            fontSize = 10.sp,
            color = TextMuted,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontSize = 17.sp,
            color = color,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace
        )
    }
}
