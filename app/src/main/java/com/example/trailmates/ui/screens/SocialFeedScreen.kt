package com.example.trailmates.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.trailmates.data.model.*
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialFeedScreen(
    feedItems: List<FeedItem>,
    currentUser: User,
    routes: List<Route>,
    onToggleLike: (String) -> Unit,
    onToggleReaction: (String, String) -> Unit,
    onAddComment: (String, String) -> Unit,
    onAddPost: (String, String?, String?) -> Unit,
    onSelectRoute: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf("all") }
    var showCreatePostDialog by remember { mutableStateOf(false) }

    val filteredItems = remember(feedItems, selectedFilter) {
        when (selectedFilter) {
            "workouts" -> feedItems.filter { it.type == "workout" }
            "discoverable" -> feedItems.filter { it.type == "discoverable" }
            "photos" -> feedItems.filter { it.type == "photo_share" }
            else -> feedItems
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
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "TRAIL FEED",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimary,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Mates activity & live workout log",
                            fontSize = 11.sp,
                            color = TextMuted,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Button(
                        onClick = { showCreatePostDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                        modifier = Modifier.testTag("btn_create_post")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Add,
                            contentDescription = "New Post",
                            tint = BgBase,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Post", color = BgBase, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Filter Pills
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FeedFilterChip(
                        label = "All",
                        selected = selectedFilter == "all",
                        onClick = { selectedFilter = "all" },
                        tag = "filter_all"
                    )
                    FeedFilterChip(
                        label = "⚡ Workouts",
                        selected = selectedFilter == "workouts",
                        onClick = { selectedFilter = "workouts" },
                        tag = "filter_workouts"
                    )
                    FeedFilterChip(
                        label = "🏔️ Trails",
                        selected = selectedFilter == "discoverable",
                        onClick = { selectedFilter = "discoverable" },
                        tag = "filter_discoverable"
                    )
                    FeedFilterChip(
                        label = "📷 Photos",
                        selected = selectedFilter == "photos",
                        onClick = { selectedFilter = "photos" },
                        tag = "filter_photos"
                    )
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
            items(filteredItems, key = { it.id }) { item ->
                FeedItemCard(
                    item = item,
                    currentUserId = currentUser.id,
                    onToggleLike = { onToggleLike(item.id) },
                    onToggleReaction = { emoji -> onToggleReaction(item.id, emoji) },
                    onAddComment = { text -> onAddComment(item.id, text) },
                    onSelectRoute = { onSelectRoute(item.routeId) }
                )
            }
        }
    }

    if (showCreatePostDialog) {
        CreatePostDialog(
            routes = routes,
            onDismiss = { showCreatePostDialog = false },
            onPost = { caption, routeId, photoUrl ->
                onAddPost(caption, routeId, photoUrl)
                showCreatePostDialog = false
            }
        )
    }
}

@Composable
private fun FeedFilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    tag: String
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (selected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark)
            .border(
                1.dp,
                if (selected) BrandGreen else SurfaceBorder,
                RoundedCornerShape(10.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .testTag(tag)
    ) {
        Text(
            text = label,
            color = if (selected) BrandGreen else TextSecondary,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            fontSize = 12.sp
        )
    }
}

@Composable
fun FeedItemCard(
    item: FeedItem,
    currentUserId: String,
    onToggleLike: () -> Unit,
    onToggleReaction: (String) -> Unit,
    onAddComment: (String) -> Unit,
    onSelectRoute: () -> Unit
) {
    var expandedComments by remember { mutableStateOf(false) }
    var commentText by remember { mutableStateOf("") }
    val isLiked = item.likes.contains(currentUserId)

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(18.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: User Avatar + Name + Timestamp
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AvatarViewer(
                    config = item.userAvatarConfig,
                    size = 44.dp,
                    activityEmoji = item.activityType.emoji
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = item.userName,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "@${item.userAvatarConfig.displayName}",
                            color = BrandGreen,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = when (item.type) {
                                "workout" -> "Completed a ${item.activityType.label} Session"
                                "discoverable" -> "Active Trail Alert"
                                else -> "Shared Trail Moment"
                            },
                            color = TextMuted,
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // Route Tag Pill
            Spacer(modifier = Modifier.height(10.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(SurfaceDark2)
                    .border(1.dp, SurfaceBorder, RoundedCornerShape(8.dp))
                    .clickable { onSelectRoute() }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(item.activityType.emoji, fontSize = 12.sp)
                    Text(
                        text = item.routeName,
                        color = BrandBlue,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    )
                    Icon(
                        imageVector = Icons.Filled.ChevronRight,
                        contentDescription = "View Route",
                        tint = BrandBlue,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            // Caption if present
            if (!item.caption.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = item.caption,
                    color = TextPrimary,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
            }

            // Workout Stats Panel if present
            if (item.workoutStats != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF0F172A))
                        .border(1.dp, Color(0xFF243248), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    StatMetric(label = "DISTANCE", value = "${item.workoutStats.distance} km", color = BrandGreen)
                    StatMetric(label = "TIME", value = "${item.workoutStats.duration} min", color = BrandBlue)
                    StatMetric(label = "ELEVATION", value = "+${item.workoutStats.elevation}m", color = BrandAccent)
                }
            }

            // Photo image if present
            if (!item.photoUrl.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                AsyncImage(
                    model = item.photoUrl,
                    contentDescription = "Trail Photo",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Actions Row (Like, Reactions, Comments trigger)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Likes & Reactions Tray
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Like Button
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { onToggleLike() }
                            .padding(horizontal = 6.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = if (isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Like",
                            tint = if (isLiked) BrandPop else TextMuted,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "${item.likes.size}",
                            color = if (isLiked) BrandPop else TextSecondary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Emoji Reaction Quick Buttons
                    listOf("🔥", "❤️", "🙌", "⚡").forEach { emoji ->
                        val users = item.reactions[emoji].orEmpty()
                        val hasReacted = users.contains(currentUserId)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (hasReacted) BrandGreen.copy(alpha = 0.15f) else Color.Transparent)
                                .border(
                                    1.dp,
                                    if (hasReacted) BrandGreen else Color.Transparent,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { onToggleReaction(emoji) }
                                .padding(horizontal = 6.dp, vertical = 3.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                Text(text = emoji, fontSize = 12.sp)
                                if (users.isNotEmpty()) {
                                    Text(
                                        text = "${users.size}",
                                        color = if (hasReacted) BrandGreen else TextMuted,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                // Comments Toggle
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { expandedComments = !expandedComments }
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.ChatBubbleOutline,
                        contentDescription = "Comments",
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "${item.comments.size}",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Expandable Comments Section
            AnimatedVisibility(
                visible = expandedComments,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp)
                ) {
                    Divider(color = SurfaceBorder, thickness = 1.dp)
                    Spacer(modifier = Modifier.height(10.dp))

                    if (item.comments.isEmpty()) {
                        Text(
                            text = "No comments yet. Be the first to cheer!",
                            color = TextMuted,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            item.comments.forEach { comment ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(SurfaceDark2)
                                        .padding(8.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    AvatarViewer(
                                        config = comment.userAvatarConfig,
                                        size = 28.dp
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = comment.userName,
                                            color = TextPrimary,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp
                                        )
                                        Text(
                                            text = comment.text,
                                            color = TextSecondary,
                                            fontSize = 12.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Add comment input
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = commentText,
                            onValueChange = { commentText = it },
                            placeholder = { Text("Write a comment...", fontSize = 12.sp) },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BrandGreen,
                                unfocusedBorderColor = SurfaceBorder
                            )
                        )
                        IconButton(
                            onClick = {
                                if (commentText.isNotBlank()) {
                                    onAddComment(commentText)
                                    commentText = ""
                                }
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(BrandGreen)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Send,
                                contentDescription = "Send",
                                tint = BgBase,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatMetric(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            fontSize = 9.sp,
            color = TextMuted,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Text(
            text = value,
            fontSize = 13.sp,
            color = color,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun CreatePostDialog(
    routes: List<Route>,
    onDismiss: () -> Unit,
    onPost: (String, String?, String?) -> Unit
) {
    var caption by remember { mutableStateOf("") }
    var selectedRouteId by remember { mutableStateOf(routes.firstOrNull()?.id ?: "") }
    var photoUrl by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        title = {
            Text(
                "Create Trail Post",
                color = TextPrimary,
                fontWeight = FontWeight.Black,
                fontSize = 18.sp
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = caption,
                    onValueChange = { caption = it },
                    label = { Text("Caption / Workout notes") },
                    placeholder = { Text("Just crushed an intense trail session!") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandGreen,
                        unfocusedBorderColor = SurfaceBorder
                    )
                )

                Text("Tag a Route:", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)

                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    routes.take(4).forEach { route ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (selectedRouteId == route.id) BrandGreen.copy(alpha = 0.2f) else SurfaceDark2)
                                .border(1.dp, if (selectedRouteId == route.id) BrandGreen else Color.Transparent, RoundedCornerShape(8.dp))
                                .clickable { selectedRouteId = route.id }
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(route.activityType.emoji, fontSize = 13.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                route.name,
                                color = if (selectedRouteId == route.id) BrandGreen else TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = photoUrl,
                    onValueChange = { photoUrl = it },
                    label = { Text("Photo URL (Optional)") },
                    placeholder = { Text("https://images.unsplash.com/...") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandGreen,
                        unfocusedBorderColor = SurfaceBorder
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (caption.isNotBlank()) {
                        onPost(caption, selectedRouteId.ifBlank { null }, photoUrl.ifBlank { null })
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
            ) {
                Text("Publish", color = BgBase, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        }
    )
}
