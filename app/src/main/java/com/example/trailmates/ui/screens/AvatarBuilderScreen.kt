package com.example.trailmates.ui.screens

import android.widget.Toast
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.trailmates.data.model.*
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.components.parseHexColor
import com.example.trailmates.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AvatarBuilderScreen(
    initialConfig: AvatarConfig,
    initialFitnessLevel: FitnessLevel,
    initialActivities: List<ActivityType>,
    onSave: (AvatarConfig, FitnessLevel, List<ActivityType>) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var config by remember { mutableStateOf(initialConfig) }
    var fitnessLevel by remember { mutableStateOf(initialFitnessLevel) }
    var activities by remember { mutableStateOf(initialActivities) }
    var activeTab by remember { mutableStateOf(0) } // 0: Identity, 1: Body & Skin, 2: Gear & Hair, 3: Accessories, 4: Fitness

    val tabs = listOf("Identity", "Body & Skin", "Gear & Hair", "Accessories", "Fitness Tier")
    val scrollState = rememberScrollState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgBase,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "PERSONA STUDIO",
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
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Live Large Avatar Showcase
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    AvatarViewer(
                        config = config,
                        size = 130.dp,
                        animate = true,
                        activityEmoji = activities.firstOrNull()?.emoji
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "@${config.displayName}",
                        color = BrandGreen,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "${config.bodyType.uppercase()} • ${config.accessory.uppercase()} • ${fitnessLevel.label.split(" ").first()}",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // Tab Selector
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(tabs.indices.toList()) { index ->
                    val isSelected = activeTab == index
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) BrandGreen else SurfaceDark)
                            .border(1.dp, if (isSelected) BrandGreen else SurfaceBorder, RoundedCornerShape(12.dp))
                            .clickable { activeTab = index }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                            .testTag("tab_$index")
                    ) {
                        Text(
                            text = tabs[index],
                            color = if (isSelected) BgBase else TextSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Tab Content Panes
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    when (activeTab) {
                        0 -> {
                            // Identity & Handle & Sports
                            Text("Athlete Handle Name", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            OutlinedTextField(
                                value = config.displayName,
                                onValueChange = { config = config.copy(displayName = it) },
                                label = { Text("Display Tag") },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("input_display_name"),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = BrandGreen,
                                    unfocusedBorderColor = SurfaceBorder
                                )
                            )

                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Preferred Disciplines", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                ActivityType.entries.forEach { act ->
                                    val isSelected = activities.contains(act)
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(if (isSelected) BrandGreen.copy(alpha = 0.15f) else SurfaceDark2)
                                            .border(1.dp, if (isSelected) BrandGreen else Color.Transparent, RoundedCornerShape(10.dp))
                                            .clickable {
                                                activities = if (isSelected) {
                                                    if (activities.size > 1) activities - act else activities
                                                } else {
                                                    activities + act
                                                }
                                            }
                                            .padding(horizontal = 12.dp, vertical = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(act.emoji, fontSize = 16.sp)
                                            Spacer(modifier = Modifier.width(10.dp))
                                            Text(act.label, color = if (isSelected) BrandGreen else TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        }
                                        Checkbox(
                                            checked = isSelected,
                                            onCheckedChange = null,
                                            colors = CheckboxDefaults.colors(checkedColor = BrandGreen)
                                        )
                                    }
                                }
                            }
                        }
                        1 -> {
                            // Body & Skin
                            Text("Body Build Archetype", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf("slim", "athletic", "muscular", "average").forEach { type ->
                                    val isSelected = config.bodyType == type
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(if (isSelected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark2)
                                            .border(1.dp, if (isSelected) BrandGreen else Color.Transparent, RoundedCornerShape(10.dp))
                                            .clickable { config = config.copy(bodyType = type) }
                                            .padding(vertical = 10.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            type.replaceFirstChar { it.uppercase() },
                                            color = if (isSelected) BrandGreen else TextSecondary,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Skin Tone Shade", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                                listOf("#ffd1b3", "#fcd34d", "#d2a172", "#8c5a3c", "#512a18", "#382013").forEach { hex ->
                                    val isSelected = config.skinTone.equals(hex, ignoreCase = true)
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(parseHexColor(hex))
                                            .border(if (isSelected) 3.dp else 1.dp, if (isSelected) BrandGreen else SurfaceBorder, CircleShape)
                                            .clickable { config = config.copy(skinTone = hex) }
                                    )
                                }
                            }
                        }
                        2 -> {
                            // Gear Jersey & Hair Style/Color
                            Text("Jersey Outfit Color", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                                listOf("#2DD4BF", "#38BDF8", "#A3E635", "#F472B6", "#F97316", "#6366F1", "#E2E8F0", "#0F172A").forEach { hex ->
                                    val isSelected = config.outfitColor.equals(hex, ignoreCase = true)
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(parseHexColor(hex))
                                            .border(if (isSelected) 3.dp else 1.dp, if (isSelected) Color.White else SurfaceBorder, CircleShape)
                                            .clickable { config = config.copy(outfitColor = hex) }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Hair Style", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf("none", "short", "long", "curly").forEach { style ->
                                    val isSelected = config.hairStyle == style
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(if (isSelected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark2)
                                            .border(1.dp, if (isSelected) BrandGreen else Color.Transparent, RoundedCornerShape(10.dp))
                                            .clickable { config = config.copy(hairStyle = style) }
                                            .padding(vertical = 8.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            style.replaceFirstChar { it.uppercase() },
                                            color = if (isSelected) BrandGreen else TextSecondary,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Hair Color", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                                listOf("#1a1a1a", "#4a3728", "#d97706", "#fcd34d", "#ec4899", "#38bdf8").forEach { hex ->
                                    val isSelected = config.hairColor.equals(hex, ignoreCase = true)
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(parseHexColor(hex))
                                            .border(if (isSelected) 3.dp else 1.dp, if (isSelected) BrandGreen else SurfaceBorder, CircleShape)
                                            .clickable { config = config.copy(hairColor = hex) }
                                    )
                                }
                            }
                        }
                        3 -> {
                            // Accessories
                            Text("Athletic Headgear & Eyewear", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf(
                                    Pair("none", "No Accessories 👤"),
                                    Pair("helmet", "Aero Sports Helmet 🪖"),
                                    Pair("cap", "Trail Runner Cap 🧢"),
                                    Pair("sunglasses", "Speed Shades / Sunglasses 🕶️"),
                                    Pair("headband", "Pro Sweatband / Headband ⚡")
                                ).forEach { (acc, label) ->
                                    val isSelected = config.accessory == acc
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(if (isSelected) BrandGreen.copy(alpha = 0.2f) else SurfaceDark2)
                                            .border(1.dp, if (isSelected) BrandGreen else Color.Transparent, RoundedCornerShape(10.dp))
                                            .clickable { config = config.copy(accessory = acc) }
                                            .padding(horizontal = 14.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(label, color = if (isSelected) BrandGreen else TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        RadioButton(
                                            selected = isSelected,
                                            onClick = null,
                                            colors = RadioButtonDefaults.colors(selectedColor = BrandGreen)
                                        )
                                    }
                                }
                            }
                        }
                        4 -> {
                            // Fitness Tier
                            Text("Fitness Level Classification", color = TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                FitnessLevel.entries.forEach { level ->
                                    val isSelected = fitnessLevel == level
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { fitnessLevel = level },
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) SurfaceDark3 else SurfaceDark2
                                        ),
                                        shape = RoundedCornerShape(12.dp),
                                        border = androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            if (isSelected) BrandGreen else Color.Transparent
                                        )
                                    ) {
                                        Column(modifier = Modifier.padding(12.dp)) {
                                            Text(
                                                level.label,
                                                color = if (isSelected) BrandGreen else TextPrimary,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 13.sp
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(level.description, color = TextMuted, fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Save Persona Button
            Button(
                onClick = {
                    onSave(config, fitnessLevel, activities)
                    Toast.makeText(context, "Avatar & Profile Saved!", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_save_avatar"),
                colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Filled.Save, contentDescription = "Save", tint = BgBase)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Save Persona Configuration", color = BgBase, fontWeight = FontWeight.Black, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
