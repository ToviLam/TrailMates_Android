package com.example.trailmates.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.ui.theme.*

enum class AppScreen(
    val id: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    FEED("feed", "Feed", Icons.Filled.DynamicFeed, Icons.Outlined.DynamicFeed),
    ROUTES("routes", "Routes", Icons.Filled.Explore, Icons.Outlined.Explore),
    CREATE_ROUTE("create_route", "Create", Icons.Filled.AddCircle, Icons.Outlined.AddCircleOutline),
    PEOPLE("people", "Mates", Icons.Filled.People, Icons.Outlined.PeopleOutline),
    PROFILE("profile", "Profile", Icons.Filled.Person, Icons.Outlined.PersonOutline)
}

@Composable
fun AppBottomNav(
    currentScreen: AppScreen,
    onNavigate: (AppScreen) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = BgBase,
        tonalElevation = 8.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp, horizontal = 12.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            AppScreen.entries.forEach { screen ->
                val isSelected = screen == currentScreen
                val isCreate = screen == AppScreen.CREATE_ROUTE

                if (isCreate) {
                    // Elevated Center Action Button
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(
                                if (isSelected) BrandGreen else Color(0xFF1E293B)
                            )
                            .border(
                                2.dp,
                                if (isSelected) BrandGreen else BrandGreen.copy(alpha = 0.5f),
                                CircleShape
                            )
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = ripple(bounded = true, color = BrandGreen)
                            ) {
                                onNavigate(screen)
                            }
                            .testTag("nav_create_route"),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Add,
                            contentDescription = "Create Route",
                            tint = if (isSelected) BgBase else BrandGreen,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = ripple(bounded = true, color = BrandGreen)
                            ) {
                                onNavigate(screen)
                            }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                            .testTag("nav_${screen.id}"),
                        horizontalAlignment = Alignment.CenterVertically,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                            contentDescription = screen.label,
                            tint = if (isSelected) BrandGreen else TextMuted,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = screen.label,
                            color = if (isSelected) BrandGreen else TextMuted,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }
        }
    }
}
