package com.example.trailmates.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.model.SessionSummary
import com.example.trailmates.data.model.User
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.components.RouteMapCanvas
import com.example.trailmates.ui.theme.*

@Composable
fun SummaryScreen(
    summary: SessionSummary,
    currentUser: User,
    onShareToFeed: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isUserWinner = summary.winnerId == currentUser.id
    val mins = summary.duration / 60
    val secs = summary.duration % 60
    val avgPace = if (summary.distance > 0.01) {
        val paceSec = (summary.duration / summary.distance).toInt()
        String.format("%d:%02d /km", paceSec / 60, paceSec % 60)
    } else "5:15 /km"

    val scrollState = rememberScrollState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgBase
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterVertically,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Celebration Banner / Icon
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                (if (isUserWinner) BrandAccent else BrandGreen).copy(alpha = 0.3f),
                                Color.Transparent
                            )
                        )
                    )
                    .border(2.dp, if (isUserWinner) BrandAccent else BrandGreen, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isUserWinner) "🏆" else "🔥",
                    fontSize = 40.sp
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (isUserWinner) "SESSION VICTORY!" else "WORKOUT COMPLETED!",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = if (isUserWinner) BrandAccent else BrandGreen,
                    letterSpacing = 1.sp,
                    fontFamily = FontFamily.SansSerif
                )
                Text(
                    text = "Crushed ${summary.route.name} alongside @${summary.partner.avatarConfig.displayName}",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Dual Avatar High-Five Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        AvatarViewer(config = currentUser.avatarConfig, size = 64.dp, animate = true)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(currentUser.name, color = BrandGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                    Text("⚡", fontSize = 28.sp)

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        AvatarViewer(config = summary.partner.avatarConfig, size = 64.dp, animate = true)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(summary.partner.name, color = BrandBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // Route Map Snapshot
            RouteMapCanvas(
                route = summary.route,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp),
                activeProgressRatio = 1.0f,
                partnerProgressRatio = 1.0f,
                showElevationProfile = false
            )

            // Primary Stat Metrics Grid
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        SummaryMetric(label = "TOTAL TIME", value = String.format("%02d:%02d", mins, secs), color = BrandGreen)
                        SummaryMetric(label = "DISTANCE", value = "${String.format("%.2f", summary.distance)} km", color = BrandBlue)
                    }

                    Divider(color = SurfaceBorder, thickness = 1.dp)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        SummaryMetric(label = "AVG PACE", value = avgPace, color = BrandAccent)
                        SummaryMetric(label = "CALORIES", value = "${summary.calories} kcal", color = BrandOrange)
                        SummaryMetric(label = "ELEV GAIN", value = "+${summary.route.elevation}m", color = BrandPop)
                    }
                }
            }

            // Action Buttons: Share to Feed & Return
            Button(
                onClick = onShareToFeed,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_share_summary_to_feed"),
                colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Filled.Share, contentDescription = "Share", tint = BgBase)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Share Workout to Feed", color = BgBase, fontWeight = FontWeight.Black, fontSize = 14.sp)
            }

            OutlinedButton(
                onClick = onClose,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("btn_close_summary"),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text("Return to Trail Explorer", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}

@Composable
private fun SummaryMetric(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            fontSize = 10.sp,
            color = TextMuted,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = value,
            fontSize = 18.sp,
            color = color,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace
        )
    }
}
