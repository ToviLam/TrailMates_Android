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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.mock.MockData
import com.example.trailmates.data.model.AvatarConfig
import com.example.trailmates.ui.components.AvatarViewer
import com.example.trailmates.ui.theme.*

@Composable
fun LandingScreen(
    onLogin: (String) -> Unit,
    onRegister: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isRegisterMode by remember { mutableStateOf(false) }
    var nameInput by remember { mutableStateOf("") }
    var emailInput by remember { mutableStateOf("") }

    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BgBase)
            .statusBarsPadding()
            .navigationBarsPadding()
            .verticalScroll(scrollState)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterVertically
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Hero Logo & Title
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(BrandGreen.copy(alpha = 0.3f), Color.Transparent)
                    )
                )
                .border(2.dp, BrandGreen, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.DirectionsRun,
                contentDescription = "TrailMates Logo",
                tint = BrandGreen,
                modifier = Modifier.size(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "TRAILMATES",
            fontSize = 32.sp,
            fontWeight = FontWeight.Black,
            color = TextPrimary,
            letterSpacing = 2.sp,
            fontFamily = FontFamily.SansSerif
        )

        Text(
            text = "Social Trail Workouts • AR Pacing • Mate Discovery",
            fontSize = 13.sp,
            color = BrandGreen,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Live Avatar Demo Trio
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            AvatarViewer(
                config = AvatarConfig(
                    bodyType = "muscular",
                    skinTone = "#d2a172",
                    outfitColor = "#38BDF8",
                    accessory = "helmet",
                    hairColor = "#1a1a1a",
                    hairStyle = "none",
                    displayName = "LeoApex"
                ),
                size = 64.dp,
                activityEmoji = "🚴"
            )
            Spacer(modifier = Modifier.width(12.dp))
            AvatarViewer(
                config = AvatarConfig(
                    bodyType = "athletic",
                    skinTone = "#ffd1b3",
                    outfitColor = "#2DD4BF",
                    accessory = "headband",
                    hairColor = "#4a3728",
                    hairStyle = "short",
                    displayName = "ToviRunner"
                ),
                size = 88.dp,
                animate = true,
                activityEmoji = "🏃"
            )
            Spacer(modifier = Modifier.width(12.dp))
            AvatarViewer(
                config = AvatarConfig(
                    bodyType = "slim",
                    skinTone = "#ffd1b3",
                    outfitColor = "#f97316",
                    accessory = "cap",
                    hairColor = "#d97706",
                    hairStyle = "long",
                    displayName = "SierraSummit"
                ),
                size = 64.dp,
                activityEmoji = "🥾"
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Auth Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceDark2)
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (!isRegisterMode) BrandGreen else Color.Transparent)
                            .clickable { isRegisterMode = false }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Quick Login",
                            color = if (!isRegisterMode) BgBase else TextSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isRegisterMode) BrandGreen else Color.Transparent)
                            .clickable { isRegisterMode = true }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Register",
                            color = if (isRegisterMode) BgBase else TextSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                if (!isRegisterMode) {
                    // Quick Login Presets
                    Text(
                        text = "SELECT AN ATHLETE PROFILE",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.align(Alignment.Start)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { onLogin("tovi@tovilam.net") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_login_tovi"),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("🏃", fontSize = 16.sp)
                            Text(
                                "Login as Tovi Lam (Intermediate)",
                                color = BgBase,
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = { onLogin("sierra@peak.com") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_login_sierra"),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = BrandBlue),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, BrandBlue),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("⛰️", fontSize = 16.sp)
                            Text(
                                "Login as Sierra Peak (Advanced)",
                                color = BrandBlue,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    }
                } else {
                    // Registration Inputs
                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = { nameInput = it },
                        label = { Text("Athlete Name / Handle") },
                        placeholder = { Text("e.g. Alex Runner") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_register_name"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandGreen,
                            unfocusedBorderColor = SurfaceBorder,
                            focusedLabelColor = BrandGreen
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it },
                        label = { Text("Email Address") },
                        placeholder = { Text("alex@trailmates.com") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_register_email"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandGreen,
                            unfocusedBorderColor = SurfaceBorder,
                            focusedLabelColor = BrandGreen
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = { onRegister(nameInput, emailInput) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_complete_registration"),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreen),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(
                            "Create Athlete Profile",
                            color = BgBase,
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Feature Highlights
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            FeaturePill(emoji = "🗺️", title = "20+ GPS Trails")
            FeaturePill(emoji = "⚡", title = "Live AR Pacing")
            FeaturePill(emoji = "👥", title = "Nearby Mates")
        }
    }
}

@Composable
private fun FeaturePill(emoji: String, title: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(SurfaceDark)
            .border(1.dp, SurfaceBorder, RoundedCornerShape(12.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(emoji, fontSize = 14.sp)
            Text(
                title,
                color = TextSecondary,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
