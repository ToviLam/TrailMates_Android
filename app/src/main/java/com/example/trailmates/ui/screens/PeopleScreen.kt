package com.example.trailmates.ui.screens

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.model.*
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.theme.*

@Composable
fun PeopleScreen(
    users: List<User>,
    currentUser: User,
    connections: List<Connection>,
    routes: List<Route>,
    onToggleConnection: (String) -> Unit,
    onSetTier: (String, String) -> Unit,
    onOpenChat: (String) -> Unit,
    onStartWorkoutWith: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("all") } // "all", "connected", "pending", "discoverable"

    val otherUsers = remember(users, currentUser) {
        users.filter { it.id != currentUser.id }
    }

    val filteredUsers = remember(otherUsers, connections, currentUser, searchQuery, selectedFilter) {
        otherUsers.filter { user ->
            val conn = connections.find {
                (it.userIds.first == currentUser.id && it.userIds.second == user.id) ||
                        (it.userIds.first == user.id && it.userIds.second == currentUser.id)
            }
            val matchFilter = when (selectedFilter) {
                "connected" -> conn?.status == "connected"
                "pending" -> conn?.status == "pending"
                "discoverable" -> user.isDiscoverable
                else -> true
            }
            val matchSearch = searchQuery.isBlank() ||
                    user.name.contains(searchQuery, ignoreCase = true) ||
                    user.avatarConfig.displayName.contains(searchQuery, ignoreCase = true) ||
                    user.activities.any { it.label.contains(searchQuery, ignoreCase = true) }
            matchFilter && matchSearch
        }
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
                Text(
                    text = "TRAIL MATES",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Connect, race challengers & train together",
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by athlete name or activity...", fontSize = 12.sp) },
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
                        .testTag("search_mates"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandGreen,
                        unfocusedBorderColor = SurfaceBorder,
                        focusedContainerColor = SurfaceDark,
                        unfocusedContainerColor = SurfaceDark
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Filter tabs
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    listOf(
                        Pair("all", "All Athletes"),
                        Pair("connected", "Connected Mates"),
                        Pair("pending", "Pending Invites"),
                        Pair("discoverable", "⚡ Live Nearby")
                    ).forEach { (id, label) ->
                        item {
                            val isSelected = selectedFilter == id
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark)
                                    .border(1.dp, if (isSelected) BrandGreen else SurfaceBorder, RoundedCornerShape(10.dp))
                                    .clickable { selectedFilter = id }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                                    .testTag("filter_$id")
                            ) {
                                Text(
                                    text = label,
                                    color = if (isSelected) BrandGreen else TextSecondary,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
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
            contentPadding = PaddingValues(bottom = 24.dp, top = 8.dp)
        ) {
            items(filteredUsers, key = { it.id }) { user ->
                val conn = connections.find {
                    (it.userIds.first == currentUser.id && it.userIds.second == user.id) ||
                            (it.userIds.first == user.id && it.userIds.second == currentUser.id)
                }
                val activeRoute = routes.find { it.id == user.currentRouteId }

                AthleteCard(
                    user = user,
                    connection = conn,
                    activeRoute = activeRoute,
                    onToggleConnection = { onToggleConnection(user.id) },
                    onSetTier = { tier -> onSetTier(user.id, tier) },
                    onOpenChat = { onOpenChat(user.id) },
                    onStartWorkout = { routeId -> onStartWorkoutWith(user.id, routeId) }
                )
            }
        }
    }
}

@Composable
fun AthleteCard(
    user: User,
    connection: Connection?,
    activeRoute: Route?,
    onToggleConnection: () -> Unit,
    onSetTier: (String) -> Unit,
    onOpenChat: () -> Unit,
    onStartWorkout: (String) -> Unit
) {
    val isConnected = connection?.status == "connected"
    val isPending = connection?.status == "pending"
    val isChallenger = connection?.tier == "challenger"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("athlete_card_${user.id}"),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(18.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header Row: Avatar + Info + Chat Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AvatarViewer(
                    config = user.avatarConfig,
                    size = 54.dp,
                    activityEmoji = user.activities.firstOrNull()?.emoji
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = user.name,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        if (isChallenger) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(BrandOrange.copy(alpha = 0.2f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("⚡ RACER", color = BrandOrange, fontSize = 9.sp, fontWeight = FontWeight.Black)
                            }
                        }
                    }

                    Text(
                        text = "@${user.avatarConfig.displayName} • ${user.location ?: "Trails"}",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // Fitness level badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(SurfaceDark2)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = user.fitnessLevel.label.split(" ").first().uppercase(),
                            color = when (user.fitnessLevel) {
                                FitnessLevel.BEGINNER -> BrandGreen
                                FitnessLevel.INTERMEDIATE -> BrandBlue
                                FitnessLevel.ADVANCED -> BrandOrange
                                FitnessLevel.ELITE -> BrandPop
                            },
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                // Chat Action Button
                IconButton(
                    onClick = onOpenChat,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceDark2)
                        .testTag("btn_chat_${user.id}")
                ) {
                    Icon(
                        imageVector = Icons.Filled.Chat,
                        contentDescription = "Message",
                        tint = BrandGreen,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Bio if present
            if (!user.bio.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = user.bio,
                    color = TextSecondary,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }

            // Active Trail Indicator
            if (activeRoute != null && user.isDiscoverable) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF0F172A))
                        .border(1.dp, BrandGreen.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("📍", fontSize = 12.sp)
                        Text(
                            text = "Live on ${activeRoute.name}",
                            color = BrandGreen,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }

                    TextButton(
                        onClick = { onStartWorkout(activeRoute.id) },
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text("Join Pace ⚡", color = BrandGreen, fontWeight = FontWeight.Black, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Row: Connect Status & Tier Selector
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onToggleConnection,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = when {
                            isConnected -> SurfaceDark2
                            isPending -> Color(0xFF334155)
                            else -> BrandGreen
                        }
                    ),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Text(
                        text = when {
                            isConnected -> "✓ Connected"
                            isPending -> "Pending..."
                            else -> "+ Connect Mate"
                        },
                        color = if (isConnected || isPending) TextSecondary else BgBase,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }

                if (isConnected) {
                    // Tier Selector: Friend vs Challenger
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceDark2)
                            .padding(2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (!isChallenger) BrandGreen.copy(alpha = 0.2f) else Color.Transparent)
                                .clickable { onSetTier("friend") }
                                .padding(horizontal = 8.dp, vertical = 6.dp)
                        ) {
                            Text("Friend 🤝", color = if (!isChallenger) BrandGreen else TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isChallenger) BrandOrange.copy(alpha = 0.2f) else Color.Transparent)
                                .clickable { onSetTier("challenger") }
                                .padding(horizontal = 8.dp, vertical = 6.dp)
                        ) {
                            Text("Challenger ⚡", color = if (isChallenger) BrandOrange else TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
