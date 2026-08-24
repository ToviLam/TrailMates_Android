package com.example.trailmates.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserGuideScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgBase,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "TRAILMATES USER GUIDE",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary,
                        letterSpacing = 1.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            GuideSection(
                emoji = "⚡",
                title = "1. Live AR Ghost Partner Workouts",
                description = "Experience outdoor and indoor pacing with synchronized ghost partners. Choose between 'Workout Together' (cooperative pacing with mutual audio cheers) or 'Competitive Match' (head-to-head racing with live meter deltas and sprint surges). Real-time telemetry tracks elapsed time, live pace (min/km), elevation climbed, and active calories."
            )

            GuideSection(
                emoji = "🗺️",
                title = "2. Trail Discovery & High-Fidelity GPX",
                description = "Explore dozens of curated GPS trails spanning North America and Asia (e.g. Hong Kong's Dragon's Back, Whistler's A-Line, Emerald Ridge Crest). Tap on any trail to inspect detailed waypoints, elevation charts, and discoverable athletes ready to pace. Export pure standard GPX XML files anytime with one click."
            )

            GuideSection(
                emoji = "🛠️",
                title = "3. Trail Studio & GPS Route Builder",
                description = "Design custom outdoor routes with our interactive map canvas. Drop waypoints to automatically compute distance and elevation gain, or activate the Live GPS Simulator to record real-world paths in real time. Tag routes with difficulty levels and broadcast your discoverability to nearby mates."
            )

            GuideSection(
                emoji = "👥",
                title = "4. Mate Connections & Challenger Tiers",
                description = "Find local trail runners, hikers, mountain bikers, and skateboarders. Send connection invites and categorize connections as 'Friends' (relaxed group sessions) or 'Challengers' (competitive leaderboard pacing). Chat 1-on-1 with preset workout invites to quickly coordinate sessions."
            )

            GuideSection(
                emoji = "🎨",
                title = "5. Persona Customizer & Adaptive Avatars",
                description = "Express your athletic identity with the Persona Studio. Customize body builds (slim, athletic, muscular, average), skin tones, athletic jerseys, hair styles/colors, and pro gear accessories (aero helmets, speed shades, trail caps, headbands)."
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun GuideSection(
    emoji: String,
    title: String,
    description: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(18.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(emoji, fontSize = 20.sp)
                Text(
                    text = title,
                    color = BrandGreen,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = description,
                color = TextSecondary,
                fontSize = 13.sp,
                lineHeight = 19.sp
            )
        }
    }
}
