package com.example.trailmates.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.model.*
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.components.RouteMapCanvas
import com.example.trailmates.ui.theme.*

@Composable
fun MapViewScreen(
    routes: List<Route>,
    users: List<User>,
    currentUser: User,
    selectedRouteId: String?,
    onSelectRoute: (String) -> Unit,
    onToggleDiscoverable: (String, Boolean) -> Unit,
    onStartLiveWorkout: (String, String, String) -> Unit,
    onOpenChat: (String) -> Unit,
    onAddPhoto: (String, RoutePhoto) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current

    var selectedActivity by remember { mutableStateOf<ActivityType?>(null) }
    var selectedRegion by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    var selectedWaypointIdx by remember { mutableStateOf<Int?>(null) }
    var showGpxExportDialog by remember { mutableStateOf(false) }
    var showAddPhotoDialog by remember { mutableStateOf(false) }
    var showWorkoutModeDialog by remember { mutableStateOf(false) }

    val filteredRoutes = remember(routes, selectedActivity, selectedRegion, searchQuery) {
        routes.filter { route ->
            val matchActivity = selectedActivity == null || route.activityType == selectedActivity
            val matchRegion = selectedRegion == "All" || route.region.equals(selectedRegion, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() ||
                    route.name.contains(searchQuery, ignoreCase = true) ||
                    route.startPointName.contains(searchQuery, ignoreCase = true) ||
                    route.endPointName.contains(searchQuery, ignoreCase = true)
            matchActivity && matchRegion && matchSearch
        }
    }

    val selectedRoute = routes.find { it.id == selectedRouteId } ?: routes.firstOrNull()
    val isUserDiscoverableOnRoute = selectedRoute?.discoverableUsers?.contains(currentUser.id) == true

    val matesOnThisRoute = remember(selectedRoute, users) {
        val userIds = selectedRoute?.discoverableUsers.orEmpty().filter { it != currentUser.id }
        users.filter { userIds.contains(it.id) }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgBase,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BgBase)
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "TRAIL DISCOVERY",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimary,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "${filteredRoutes.size} curated trails available",
                            fontSize = 11.sp,
                            color = TextMuted,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    // Region Selector Dropdown Chip
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceDark)
                            .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("📍", fontSize = 12.sp)
                            Text(
                                selectedRegion,
                                color = BrandGreen,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Search Box
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search trail, summit, region...", fontSize = 12.sp) },
                    leadingIcon = {
                        Icon(Icons.Filled.Search, contentDescription = "Search", tint = TextMuted)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Filled.Clear, contentDescription = "Clear", tint = TextMuted)
                            }
                        }
                    },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("search_trails"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandGreen,
                        unfocusedBorderColor = SurfaceBorder,
                        focusedContainerColor = SurfaceDark,
                        unfocusedContainerColor = SurfaceDark
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Activity Filter Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            label = "All",
                            selected = selectedActivity == null,
                            onClick = { selectedActivity = null }
                        )
                    }
                    items(ActivityType.entries) { act ->
                        FilterChip(
                            label = "${act.emoji} ${act.label}",
                            selected = selectedActivity == act,
                            onClick = { selectedActivity = act }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Region filter row
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    listOf("All", "USA", "Hong Kong", "Canada").forEach { reg ->
                        item {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selectedRegion == reg) BrandBlue.copy(alpha = 0.2f) else SurfaceDark2)
                                    .border(1.dp, if (selectedRegion == reg) BrandBlue else Color.Transparent, RoundedCornerShape(8.dp))
                                    .clickable { selectedRegion = reg }
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = reg,
                                    color = if (selectedRegion == reg) BrandBlue else TextSecondary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 32.dp, top = 6.dp)
        ) {
            // 1. Detailed Map Canvas for Selected Route
            if (selectedRoute != null) {
                item {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        RouteMapCanvas(
                            route = selectedRoute,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(220.dp),
                            selectedWaypointIndex = selectedWaypointIdx,
                            onSelectWaypoint = { idx -> selectedWaypointIdx = idx }
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Route Title & Quick Action Strip
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = selectedRoute.name,
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp
                                )
                                Text(
                                    text = "${selectedRoute.startPointName} ➔ ${selectedRoute.endPointName}",
                                    color = TextMuted,
                                    fontSize = 11.sp
                                )
                            }

                            // Discoverable Status Toggle
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = if (isUserDiscoverableOnRoute) "Live" else "Hidden",
                                    color = if (isUserDiscoverableOnRoute) BrandGreen else TextMuted,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                                Switch(
                                    checked = isUserDiscoverableOnRoute,
                                    onCheckedChange = { onToggleDiscoverable(selectedRoute.id, it) },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = BrandGreen,
                                        checkedTrackColor = BrandGreen.copy(alpha = 0.3f)
                                    ),
                                    modifier = Modifier.testTag("switch_discoverable")
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Action Buttons: Start Workout, GPX Export, Add Photo
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { showWorkoutModeDialog = true },
                                modifier = Modifier
                                    .weight(1.5f)
                                    .height(48.dp)
                                    .testTag("btn_start_workout"),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Filled.PlayArrow, contentDescription = "Start", tint = BgBase, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Start AR Workout", color = BgBase, fontWeight = FontWeight.Black, fontSize = 13.sp)
                            }

                            OutlinedButton(
                                onClick = { showGpxExportDialog = true },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .testTag("btn_export_gpx"),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = BrandBlue),
                                border = androidx.compose.foundation.BorderStroke(1.dp, BrandBlue),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Filled.FileDownload, contentDescription = "GPX", tint = BrandBlue, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("GPX", color = BrandBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }

                            IconButton(
                                onClick = { showAddPhotoDialog = true },
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(SurfaceDark2)
                                    .border(1.dp, SurfaceBorder, RoundedCornerShape(12.dp))
                            ) {
                                Icon(Icons.Filled.AddAPhoto, contentDescription = "Add Photo", tint = BrandAccent)
                            }
                        }

                        // Mates Nearby on this trail
                        if (matesOnThisRoute.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(14.dp))
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                shape = RoundedCornerShape(14.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, BrandGreen.copy(alpha = 0.3f))
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text("🔥", fontSize = 13.sp)
                                        Text(
                                            "MATES READY ON THIS TRAIL",
                                            color = BrandGreen,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    matesOnThisRoute.forEach { mate ->
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(SurfaceDark2)
                                                .padding(8.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                AvatarViewer(config = mate.avatarConfig, size = 36.dp)
                                                Spacer(modifier = Modifier.width(10.dp))
                                                Column {
                                                    Text(mate.name, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                                    Text(
                                                        "${mate.fitnessLevel.label.split(" ").first()} • Ready to pace",
                                                        color = BrandGreen,
                                                        fontSize = 10.sp
                                                    )
                                                }
                                            }

                                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                                IconButton(
                                                    onClick = { onOpenChat(mate.id) },
                                                    modifier = Modifier.size(36.dp)
                                                ) {
                                                    Icon(Icons.Filled.Chat, contentDescription = "Chat", tint = BrandBlue, modifier = Modifier.size(18.dp))
                                                }
                                                Button(
                                                    onClick = { onStartLiveWorkout(selectedRoute.id, mate.id, "together") },
                                                    colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                                                    shape = RoundedCornerShape(8.dp),
                                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                                ) {
                                                    Text("Join", color = BgBase, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                }
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(6.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 2. Trail Explorer List Header
            item {
                Text(
                    text = "EXPLORE TRAILS",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // 3. Routes List
            items(filteredRoutes, key = { it.id }) { route ->
                val isSelected = route.id == selectedRouteId
                RouteCard(
                    route = route,
                    isSelected = isSelected,
                    onClick = { onSelectRoute(route.id) }
                )
            }
        }
    }

    // Workout Mode Picker Dialog
    if (showWorkoutModeDialog && selectedRoute != null) {
        val partner = matesOnThisRoute.firstOrNull() ?: users.find { it.id != currentUser.id } ?: currentUser
        AlertDialog(
            onDismissRequest = { showWorkoutModeDialog = false },
            containerColor = SurfaceDark,
            title = {
                Text("Select AR Workout Mode", color = TextPrimary, fontWeight = FontWeight.Black)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        "Pacing on ${selectedRoute.name} with ghost runner @${partner.avatarConfig.displayName}",
                        color = TextSecondary,
                        fontSize = 13.sp
                    )

                    // Option 1: Workout Together
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                showWorkoutModeDialog = false
                                onStartLiveWorkout(selectedRoute.id, partner.id, "together")
                            },
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark2),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BrandGreen)
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("🤝", fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Workout Together", color = BrandGreen, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("Pace alongside partner, mutual audio cheers & sync.", color = TextSecondary, fontSize = 11.sp)
                            }
                        }
                    }

                    // Option 2: Competitive Match
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                showWorkoutModeDialog = false
                                onStartLiveWorkout(selectedRoute.id, partner.id, "compete")
                            },
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark2),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BrandOrange)
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("⚡", fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Competitive Match", color = BrandOrange, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("Race against ghost partner pace with lead/lag deltas.", color = TextSecondary, fontSize = 11.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showWorkoutModeDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }

    // GPX Export Dialog
    if (showGpxExportDialog && selectedRoute != null) {
        val gpxXml = remember(selectedRoute) {
            buildString {
                appendLine("""<?xml version="1.0" encoding="UTF-8"?>""")
                appendLine("""<gpx version="1.1" creator="TrailMates" xmlns="http://www.topografix.com/GPX/1/1">""")
                appendLine("""  <metadata><name>${selectedRoute.name}</name></metadata>""")
                appendLine("""  <trk><name>${selectedRoute.name}</name><trkseg>""")
                selectedRoute.gpxPath.forEach { wp ->
                    appendLine("""    <trkpt lat="${wp.lat}" lon="${wp.lng}"><ele>${wp.ele}</ele></trkpt>""")
                }
                appendLine("""  </trkseg></trk>""")
                appendLine("""</gpx>""")
            }
        }

        AlertDialog(
            onDismissRequest = { showGpxExportDialog = false },
            containerColor = SurfaceDark,
            title = {
                Text("Export GPX Track", color = TextPrimary, fontWeight = FontWeight.Black)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Route: ${selectedRoute.name} (${selectedRoute.gpxPath.size} trackpoints)",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                    OutlinedTextField(
                        value = gpxXml.take(300) + "...\n(Total ${gpxXml.length} bytes)",
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            color = BrandGreen
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF0B1120),
                            unfocusedContainerColor = Color(0xFF0B1120)
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        clipboardManager.setText(AnnotatedString(gpxXml))
                        Toast.makeText(context, "GPX XML copied to clipboard!", Toast.LENGTH_SHORT).show()
                        showGpxExportDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
                ) {
                    Text("Copy GPX to Clipboard", color = BgBase, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showGpxExportDialog = false }) {
                    Text("Close", color = TextSecondary)
                }
            }
        )
    }

    // Add Photo Dialog
    if (showAddPhotoDialog && selectedRoute != null) {
        var photoUrl by remember { mutableStateOf("") }
        var waypointIdx by remember { mutableStateOf("0") }

        AlertDialog(
            onDismissRequest = { showAddPhotoDialog = false },
            containerColor = SurfaceDark,
            title = { Text("Add Trail Photo", color = TextPrimary, fontWeight = FontWeight.Black) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = photoUrl,
                        onValueChange = { photoUrl = it },
                        label = { Text("Image URL") },
                        placeholder = { Text("https://images.unsplash.com/...") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = waypointIdx,
                        onValueChange = { waypointIdx = it },
                        label = { Text("Waypoint Index (0 - ${selectedRoute.waypoints.size - 1})") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (photoUrl.isNotBlank()) {
                            val idx = waypointIdx.toIntOrNull() ?: 0
                            onAddPhoto(selectedRoute.id, RoutePhoto(photoUrl, idx))
                            showAddPhotoDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
                ) {
                    Text("Add Photo", color = BgBase, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddPhotoDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}

@Composable
private fun FilterChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (selected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark)
            .border(1.dp, if (selected) BrandGreen else SurfaceBorder, RoundedCornerShape(10.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            color = if (selected) BrandGreen else TextSecondary,
            fontSize = 12.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium
        )
    }
}

@Composable
fun RouteCard(
    route: Route,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("route_card_${route.id}"),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) SurfaceDark2 else SurfaceDark
        ),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(
            if (isSelected) 1.5.dp else 1.dp,
            if (isSelected) BrandGreen else SurfaceBorder
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(route.activityType.emoji, fontSize = 14.sp)
                    Text(
                        text = route.name,
                        color = if (isSelected) BrandGreen else TextPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "${route.region} • ${route.startPointName}",
                    color = TextMuted,
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFF0F172A))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "${route.distance} km",
                            color = BrandGreen,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFF0F172A))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "+${route.elevation}m",
                            color = BrandAccent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFF0F172A))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = route.difficulty.uppercase(),
                            color = when (route.difficulty) {
                                "easy" -> BrandGreen
                                "moderate" -> BrandBlue
                                "hard" -> BrandOrange
                                else -> DangerRed
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }

            Icon(
                imageVector = if (isSelected) Icons.Filled.RadioButtonChecked else Icons.Filled.ChevronRight,
                contentDescription = "Select",
                tint = if (isSelected) BrandGreen else TextMuted,
                modifier = Modifier.size(22.dp)
            )
        }
    }
}
