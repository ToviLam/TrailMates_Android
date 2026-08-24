package com.example.trailmates.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.model.Route
import com.example.trailmates.data.model.Waypoint
import com.example.trailmates.ui.theme.*
import kotlin.math.*

@Composable
fun RouteMapCanvas(
    route: Route?,
    modifier: Modifier = Modifier,
    activeProgressRatio: Float? = null,
    partnerProgressRatio: Float? = null,
    selectedWaypointIndex: Int? = null,
    onSelectWaypoint: ((Int) -> Unit)? = null,
    showElevationProfile: Boolean = true
) {
    val infiniteTransition = rememberInfiniteTransition(label = "radar")
    val radarPulse by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "radar_pulse"
    )
    val radarAlpha by infiniteTransition.animateFloat(
        initialValue = 0.7f,
        targetValue = 0.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "radar_alpha"
    )

    val waypoints = route?.waypoints.orEmpty()
    val gpxPath = if (!route?.gpxPath.isNullOrEmpty()) route!!.gpxPath else waypoints

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF0F172A))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(20.dp))
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(waypoints) {
                    detectTapGestures { tapOffset ->
                        if (waypoints.isEmpty() || onSelectWaypoint == null) return@detectTapGestures
                        // Find closest waypoint to tap
                        val bounds = calculateBounds(waypoints)
                        var closestIndex = -1
                        var minDistance = Float.MAX_VALUE

                        waypoints.forEachIndexed { index, wp ->
                            val pt = projectPoint(wp.lat, wp.lng, bounds, size.width.toFloat(), size.height.toFloat())
                            val dist = sqrt((pt.x - tapOffset.x).pow(2) + (pt.y - tapOffset.y).pow(2))
                            if (dist < minDistance && dist < 60f) {
                                minDistance = dist
                                closestIndex = index
                            }
                        }
                        if (closestIndex != -1) {
                            onSelectWaypoint(closestIndex)
                        }
                    }
                }
        ) {
            drawMapBackground()

            if (gpxPath.size >= 2) {
                val bounds = calculateBounds(waypoints.ifEmpty { gpxPath })

                // Draw GPX Trail Path with Glow
                val path = Path()
                val points = gpxPath.map { wp ->
                    projectPoint(wp.lat, wp.lng, bounds, size.width, size.height)
                }

                if (points.isNotEmpty()) {
                    path.moveTo(points.first().x, points.first().y)
                    for (i in 1 until points.size) {
                        path.lineTo(points[i].x, points[i].y)
                    }

                    // Outer ambient glow
                    drawPath(
                        path = path,
                        color = BrandGreen.copy(alpha = 0.25f),
                        style = Stroke(width = 12f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )

                    // Core track line
                    drawPath(
                        path = path,
                        brush = Brush.linearGradient(
                            colors = listOf(BrandGreen, BrandBlue, BrandAccent),
                            start = points.first(),
                            end = points.last()
                        ),
                        style = Stroke(width = 5f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                }

                // Draw Waypoints
                waypoints.forEachIndexed { index, wp ->
                    val pt = projectPoint(wp.lat, wp.lng, bounds, size.width, size.height)
                    val isStart = index == 0
                    val isEnd = index == waypoints.size - 1
                    val isSelected = selectedWaypointIndex == index

                    when {
                        isStart -> {
                            // Green Start Pin
                            drawCircle(color = BrandGreen.copy(alpha = 0.3f), radius = 16f, center = pt)
                            drawCircle(color = BrandGreen, radius = 9f, center = pt)
                            drawCircle(color = Color(0xFF0F172A), radius = 4f, center = pt)
                        }
                        isEnd -> {
                            // Orange / Amber Finish Pin
                            drawCircle(color = BrandOrange.copy(alpha = 0.3f), radius = 16f, center = pt)
                            drawCircle(color = BrandOrange, radius = 9f, center = pt)
                            drawCircle(color = Color.White, radius = 4f, center = pt)
                        }
                        else -> {
                            // Intermediate waypoints
                            val color = if (isSelected) BrandPop else BrandBlue
                            val radius = if (isSelected) 8f else 5f
                            drawCircle(color = color.copy(alpha = 0.3f), radius = radius * 2f, center = pt)
                            drawCircle(color = color, radius = radius, center = pt)
                        }
                    }
                }

                // Draw Active User Live Runner Pin
                activeProgressRatio?.let { ratio ->
                    val clamped = ratio.coerceIn(0f, 1f)
                    val targetIdx = (clamped * (points.size - 1)).toInt().coerceIn(0, points.size - 1)
                    val runnerPt = points[targetIdx]

                    // Radar wave
                    drawCircle(
                        color = BrandGreen.copy(alpha = radarAlpha),
                        radius = 24f * radarPulse,
                        center = runnerPt,
                        style = Stroke(2f)
                    )
                    // Core point
                    drawCircle(color = Color(0xFF0F172A), radius = 11f, center = runnerPt)
                    drawCircle(color = BrandGreen, radius = 8f, center = runnerPt)
                    drawCircle(color = Color.White, radius = 3.5f, center = runnerPt)
                }

                // Draw Partner Ghost Runner Pin if active
                partnerProgressRatio?.let { pRatio ->
                    val pClamped = pRatio.coerceIn(0f, 1f)
                    val pTargetIdx = (pClamped * (points.size - 1)).toInt().coerceIn(0, points.size - 1)
                    val partnerPt = points[pTargetIdx]

                    drawCircle(
                        color = BrandBlue.copy(alpha = 0.4f),
                        radius = 16f,
                        center = partnerPt
                    )
                    drawCircle(color = Color(0xFF0F172A), radius = 10f, center = partnerPt)
                    drawCircle(color = BrandBlue, radius = 7f, center = partnerPt)
                }
            }
        }

        // Top info header overlay
        if (route != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xDD0B1120))
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = route.activityType.emoji,
                            fontSize = 13.sp
                        )
                        Text(
                            text = "${route.distance} km",
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "•",
                            color = TextMuted,
                            fontSize = 10.sp
                        )
                        Text(
                            text = "+${route.elevation}m",
                            color = BrandAccent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xDD0B1120))
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = route.difficulty.uppercase(),
                        color = when (route.difficulty) {
                            "easy" -> BrandGreen
                            "moderate" -> BrandBlue
                            "hard" -> BrandOrange
                            else -> DangerRed
                        },
                        fontWeight = FontWeight.Black,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }

        // Bottom elevation profile / selected waypoint tooltip
        if (showElevationProfile && route != null && waypoints.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                if (selectedWaypointIndex != null && selectedWaypointIndex in waypoints.indices) {
                    val wp = waypoints[selectedWaypointIndex]
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xEE1E293B))
                            .border(1.dp, BrandBlue.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                            .padding(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = wp.label ?: "Waypoint #${selectedWaypointIndex + 1}",
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = "Lat: ${"%.4f".format(wp.lat)}, Lng: ${"%.4f".format(wp.lng)}",
                                    color = TextSecondary,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(BrandBlue.copy(alpha = 0.15f))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "${wp.ele}m ELEV",
                                    color = BrandBlue,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                } else {
                    // Elevation curve mini graph
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0x990B1120))
                            .border(1.dp, Color(0x33334155), RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val elePoints = waypoints.map { it.ele.toFloat() }
                            val minEle = (elePoints.minOrNull() ?: 0f).coerceAtLeast(0f)
                            val maxEle = (elePoints.maxOrNull() ?: 100f).coerceAtLeast(minEle + 20f)
                            val eleRange = (maxEle - minEle).coerceAtLeast(1f)

                            val path = Path()
                            val fillPath = Path()
                            val stepX = size.width / (elePoints.size - 1).coerceAtLeast(1)

                            elePoints.forEachIndexed { index, ele ->
                                val x = index * stepX
                                val normalizedEle = (ele - minEle) / eleRange
                                val y = size.height - (normalizedEle * (size.height - 8f)) - 4f

                                if (index == 0) {
                                    path.moveTo(x, y)
                                    fillPath.moveTo(x, size.height)
                                    fillPath.lineTo(x, y)
                                } else {
                                    path.lineTo(x, y)
                                    fillPath.lineTo(x, y)
                                }
                            }
                            fillPath.lineTo(size.width, size.height)
                            fillPath.close()

                            drawPath(
                                path = fillPath,
                                color = BrandGreen.copy(alpha = 0.15f)
                            )
                            drawPath(
                                path = path,
                                color = BrandGreen,
                                style = Stroke(width = 2f)
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun DrawScope.drawMapBackground() {
    // Subtle topographic grid matrix
    val step = 32f
    var x = 0f
    while (x < size.width) {
        drawLine(
            color = Color(0x15FFFFFF),
            start = Offset(x, 0f),
            end = Offset(x, size.height),
            strokeWidth = 1f
        )
        x += step
    }
    var y = 0f
    while (y < size.height) {
        drawLine(
            color = Color(0x15FFFFFF),
            start = Offset(0f, y),
            end = Offset(size.width, y),
            strokeWidth = 1f
        )
        y += step
    }
}

data class MapBounds(
    val minLat: Double,
    val maxLat: Double,
    val minLng: Double,
    val maxLng: Double
)

private fun calculateBounds(waypoints: List<Waypoint>): MapBounds {
    if (waypoints.isEmpty()) {
        return MapBounds(37.75, 37.85, -122.51, -122.41)
    }
    var minLat = waypoints[0].lat
    var maxLat = waypoints[0].lat
    var minLng = waypoints[0].lng
    var maxLng = waypoints[0].lng

    waypoints.forEach { wp ->
        if (wp.lat < minLat) minLat = wp.lat
        if (wp.lat > maxLat) maxLat = wp.lat
        if (wp.lng < minLng) minLng = wp.lng
        if (wp.lng > maxLng) maxLng = wp.lng
    }

    val latPad = ((maxLat - minLat) * 0.25).coerceAtLeast(0.005)
    val lngPad = ((maxLng - minLng) * 0.25).coerceAtLeast(0.005)

    return MapBounds(
        minLat = minLat - latPad,
        maxLat = maxLat + latPad,
        minLng = minLng - lngPad,
        maxLng = maxLng + lngPad
    )
}

private fun projectPoint(lat: Double, lng: Double, bounds: MapBounds, width: Float, height: Float): Offset {
    val latRange = (bounds.maxLat - bounds.minLat).coerceAtLeast(0.0001)
    val lngRange = (bounds.maxLng - bounds.minLng).coerceAtLeast(0.0001)

    // Note: latitude increases upwards (lower Y), longitude increases rightwards (higher X)
    val normX = ((lng - bounds.minLng) / lngRange).toFloat()
    val normY = (1.0 - ((lat - bounds.minLat) / latRange)).toFloat()

    val padding = 36f
    val effectiveWidth = (width - padding * 2).coerceAtLeast(10f)
    val effectiveHeight = (height - padding * 2).coerceAtLeast(10f)

    val x = padding + (normX * effectiveWidth)
    val y = padding + (normY * effectiveHeight)

    return Offset(x, y)
}
