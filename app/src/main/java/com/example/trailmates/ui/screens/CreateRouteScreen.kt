package com.example.trailmates.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.mock.MockData
import com.example.trailmates.data.model.*
import com.example.trailmates.ui.components.RouteMapCanvas
import com.example.trailmates.ui.theme.*
import kotlinx.coroutines.delay
import java.util.UUID
import kotlin.math.*

@Composable
fun CreateRouteScreen(
    onPublishRoute: (Route, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var routeName by remember { mutableStateOf("") }
    var selectedActivity by remember { mutableStateOf(ActivityType.HIKING) }
    var selectedDifficulty by remember { mutableStateOf("moderate") }
    var selectedRegion by remember { mutableStateOf("USA") }
    var startPointName by remember { mutableStateOf("") }
    var endPointName by remember { mutableStateOf("") }
    var makeDiscoverable by remember { mutableStateOf(true) }

    // Interactive Waypoints
    var waypoints by remember {
        mutableStateOf(
            listOf(
                Waypoint(37.8200, -122.4800, 100, label = "Trailhead"),
                Waypoint(37.8280, -122.4700, 240, label = "Scenic Ridge"),
                Waypoint(37.8350, -122.4600, 350, label = "Summit Vista")
            )
        )
    }

    // Live GPS Recording Simulation
    var isRecordingGPS by remember { mutableStateOf(false) }
    var recordingSeconds by remember { mutableStateOf(0) }

    LaunchedEffect(isRecordingGPS) {
        if (isRecordingGPS) {
            while (isRecordingGPS) {
                delay(1000)
                recordingSeconds++
                // Add simulated GPS drift every 5 seconds
                if (recordingSeconds % 5 == 0) {
                    val last = waypoints.lastOrNull() ?: Waypoint(37.8200, -122.4800, 100)
                    val newLat = last.lat + (0.002 * (0.5 - Math.random()))
                    val newLng = last.lng + (0.002 * (0.5 - Math.random()))
                    val newEle = (last.ele + (Math.random() * 20 - 5).toInt()).coerceAtLeast(0)
                    waypoints = waypoints + Waypoint(newLat, newLng, newEle, label = "GPS Mark #${waypoints.size + 1}")
                }
            }
        }
    }

    // Auto-calculated distance in km
    val calculatedDistance = remember(waypoints) {
        if (waypoints.size < 2) 0.0
        else {
            var dist = 0.0
            for (i in 0 until waypoints.size - 1) {
                val p1 = waypoints[i]
                val p2 = waypoints[i + 1]
                val dLat = Math.toRadians(p2.lat - p1.lat)
                val dLng = Math.toRadians(p2.lng - p1.lng)
                val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(p1.lat)) * cos(Math.toRadians(p2.lat)) * sin(dLng / 2).pow(2)
                val c = 2 * atan2(sqrt(a), sqrt(1 - a))
                dist += 6371.0 * c
            }
            ((dist * 10).roundToInt() / 10.0).coerceAtLeast(0.5)
        }
    }

    val calculatedElevation = remember(waypoints) {
        if (waypoints.isEmpty()) 0
        else {
            val minE = waypoints.minOf { it.ele }
            val maxE = waypoints.maxOf { it.ele }
            maxE - minE
        }
    }

    val previewRoute = remember(routeName, selectedActivity, selectedDifficulty, calculatedDistance, calculatedElevation, waypoints, startPointName, endPointName, selectedRegion) {
        Route(
            id = "custom-${UUID.randomUUID()}",
            name = routeName.ifBlank { "New Custom Trail" },
            activityType = selectedActivity,
            distance = calculatedDistance,
            difficulty = selectedDifficulty,
            elevation = calculatedElevation,
            waypoints = waypoints,
            startPointName = startPointName.ifBlank { "Custom Start" },
            endPointName = endPointName.ifBlank { "Custom Finish" },
            region = selectedRegion,
            gpxPath = MockData.generateHighFidelityGpxPath(waypoints)
        )
    }

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
                    text = "TRAIL STUDIO",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Design custom GPX routes & invite nearby mates",
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
            // Live Route Canvas Preview
            Column {
                RouteMapCanvas(
                    route = previewRoute,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Canvas Waypoints Controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${waypoints.size} Waypoints • ${calculatedDistance}km • +${calculatedElevation}m",
                        color = BrandGreen,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        TextButton(
                            onClick = {
                                if (waypoints.size > 2) {
                                    waypoints = waypoints.dropLast(1)
                                }
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("Undo Point", color = DangerRed, fontSize = 11.sp)
                        }

                        Button(
                            onClick = {
                                val last = waypoints.lastOrNull() ?: Waypoint(37.8200, -122.4800, 100)
                                val newLat = last.lat + 0.005
                                val newLng = last.lng + 0.005
                                val newEle = last.ele + 40
                                waypoints = waypoints + Waypoint(newLat, newLng, newEle, label = "Point #${waypoints.size + 1}")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark2),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text("+ Add Waypoint", color = BrandBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // GPS Simulation Recording Bar
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (isRecordingGPS) Color(0xFF1E3A2F) else SurfaceDark
                ),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isRecordingGPS) BrandGreen else SurfaceBorder
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(if (isRecordingGPS) DangerRed else TextMuted)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = if (isRecordingGPS) "LIVE GPS RECORDING" else "GPS SIMULATOR",
                                color = if (isRecordingGPS) BrandGreen else TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            if (isRecordingGPS) {
                                val mins = recordingSeconds / 60
                                val secs = recordingSeconds % 60
                                Text(
                                    text = String.format("Timer: %02d:%02d • Tracking live drift", mins, secs),
                                    color = TextSecondary,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }

                    Button(
                        onClick = { isRecordingGPS = !isRecordingGPS },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isRecordingGPS) DangerRed else BrandGreen
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = if (isRecordingGPS) "Stop GPS" else "Record GPS",
                            color = BgBase,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Trail Details Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    OutlinedTextField(
                        value = routeName,
                        onValueChange = { routeName = it },
                        label = { Text("Trail Name") },
                        placeholder = { Text("e.g. Skyline Ridge Crest") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_route_name"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandGreen,
                            unfocusedBorderColor = SurfaceBorder
                        )
                    )

                    // Activity Selection
                    Column {
                        Text("Discipline / Activity:", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(ActivityType.entries) { act ->
                                val isSelected = act == selectedActivity
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSelected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark2)
                                        .border(1.dp, if (isSelected) BrandGreen else Color.Transparent, RoundedCornerShape(10.dp))
                                        .clickable { selectedActivity = act }
                                        .padding(horizontal = 12.dp, vertical = 8.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(act.emoji, fontSize = 14.sp)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            act.label,
                                            color = if (isSelected) BrandGreen else TextSecondary,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Difficulty Selection
                    Column {
                        Text("Difficulty Tier:", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("easy", "moderate", "hard", "expert").forEach { diff ->
                                val isSelected = diff == selectedDifficulty
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSelected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark2)
                                        .border(1.dp, if (isSelected) BrandGreen else Color.Transparent, RoundedCornerShape(10.dp))
                                        .clickable { selectedDifficulty = diff }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = diff.replaceFirstChar { it.uppercase() },
                                        color = if (isSelected) BrandGreen else TextSecondary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }

                    // Start & End Point Names
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = startPointName,
                            onValueChange = { startPointName = it },
                            label = { Text("Start Point") },
                            placeholder = { Text("Gateway") },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = endPointName,
                            onValueChange = { endPointName = it },
                            label = { Text("End Vista") },
                            placeholder = { Text("Summit") },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }

                    // Region Selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Region:", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("USA", "Hong Kong", "Canada").forEach { reg ->
                                val isSelected = reg == selectedRegion
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(if (isSelected) BrandBlue.copy(alpha = 0.2f) else SurfaceDark2)
                                        .border(1.dp, if (isSelected) BrandBlue else Color.Transparent, RoundedCornerShape(8.dp))
                                        .clickable { selectedRegion = reg }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = reg,
                                        color = if (isSelected) BrandBlue else TextSecondary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }

                    // Discoverable Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(SurfaceDark2)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Make Discoverable to Mates", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Broadcast that you're active on this trail", color = TextMuted, fontSize = 10.sp)
                        }
                        Switch(
                            checked = makeDiscoverable,
                            onCheckedChange = { makeDiscoverable = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = BrandGreen,
                                checkedTrackColor = BrandGreen.copy(alpha = 0.3f)
                            )
                        )
                    }
                }
            }

            // Publish Button
            Button(
                onClick = {
                    if (routeName.isBlank()) {
                        Toast.makeText(context, "Please enter a trail name", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    val newRoute = Route(
                        id = "route-${UUID.randomUUID().toString().take(6)}",
                        name = routeName.trim(),
                        activityType = selectedActivity,
                        distance = calculatedDistance,
                        difficulty = selectedDifficulty,
                        elevation = calculatedElevation,
                        waypoints = waypoints,
                        startPointName = startPointName.ifBlank { "Trailhead Base" },
                        endPointName = endPointName.ifBlank { "Summit Finish" },
                        region = selectedRegion,
                        gpxPath = MockData.generateHighFidelityGpxPath(waypoints)
                    )
                    onPublishRoute(newRoute, makeDiscoverable)
                    Toast.makeText(context, "Trail published successfully!", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .testTag("btn_publish_route"),
                colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Filled.CloudUpload, contentDescription = "Publish", tint = BgBase)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Publish Trail & Save to Explorer", color = BgBase, fontWeight = FontWeight.Black, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
