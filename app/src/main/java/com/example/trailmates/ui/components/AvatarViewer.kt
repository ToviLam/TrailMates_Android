package com.example.trailmates.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.trailmates.data.model.AvatarConfig
import com.example.trailmates.ui.theme.BrandGreen

fun parseHexColor(hex: String, fallback: Color = Color.White): Color {
    return try {
        val clean = hex.removePrefix("#")
        val colorLong = if (clean.length == 6) {
            "FF$clean".toLong(16)
        } else {
            clean.toLong(16)
        }
        Color(colorLong)
    } catch (_: Exception) {
        fallback
    }
}

@Composable
fun AvatarViewer(
    config: AvatarConfig,
    modifier: Modifier = Modifier,
    size: Dp = 80.dp,
    animate: Boolean = false,
    activityEmoji: String? = null
) {
    val infiniteTransition = rememberInfiniteTransition(label = "avatar")
    val bounceY by if (animate) {
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = -6f,
            animationSpec = infiniteRepeatable(
                animation = tween(800, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "bounce"
        )
    } else {
        rememberUpdatedState(0f)
    }

    val skinColor = parseHexColor(config.skinTone, Color(0xFFFFD1B3))
    val outfitColor = parseHexColor(config.outfitColor, BrandGreen)
    val hairColor = parseHexColor(config.hairColor, Color(0xFF4A3728))

    Box(
        modifier = modifier
            .size(size)
            .offset(y = bounceY.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawAvatar(
                config = config,
                skinColor = skinColor,
                outfitColor = outfitColor,
                hairColor = hairColor
            )
        }

        if (activityEmoji != null) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(size * 0.32f)
                    .clip(CircleShape)
                    .background(Color(0xFF0F172A))
                    .border(1.dp, Color(0xFF334155), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = activityEmoji,
                    fontSize = (size.value * 0.16f).sp
                )
            }
        }
    }
}

private fun DrawScope.drawAvatar(
    config: AvatarConfig,
    skinColor: Color,
    outfitColor: Color,
    hairColor: Color
) {
    val w = size.width
    val h = size.height

    // Scale factors based on 100x100 reference
    fun scaleX(x: Float) = (x / 100f) * w
    fun scaleY(y: Float) = (y / 100f) * h

    val bodyType = config.bodyType
    val (shoulderWidth, torsoWidth, neckWidth) = when (bodyType) {
        "muscular" -> Triple(56f, 48f, 15f)
        "slim" -> Triple(38f, 34f, 10f)
        "athletic" -> Triple(48f, 40f, 12f)
        else -> Triple(46f, 42f, 12f) // average
    }

    // 1. Subtle Ground Shadow
    drawOval(
        color = Color(0x33000000),
        topLeft = Offset(scaleX(20f), scaleY(90f)),
        size = Size(scaleX(60f), scaleY(8f))
    )

    // 2. Energy Glow / Field Ring
    drawCircle(
        color = outfitColor.copy(alpha = 0.25f),
        radius = scaleX(42f),
        center = Offset(scaleX(50f), scaleY(50f)),
        style = Stroke(
            width = scaleX(1.5f),
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(scaleX(4f), scaleX(4f)))
        )
    )

    // 3. Neck
    val neckX = 50f - neckWidth / 2f
    drawRoundRect(
        color = skinColor,
        topLeft = Offset(scaleX(neckX), scaleY(54f)),
        size = Size(scaleX(neckWidth), scaleY(18f)),
        cornerRadius = androidx.compose.ui.geometry.CornerRadius(scaleX(4f), scaleY(4f))
    )
    // Neck shadow under chin
    drawRect(
        color = Color(0x22000000),
        topLeft = Offset(scaleX(neckX), scaleY(58f)),
        size = Size(scaleX(neckWidth), scaleY(6f))
    )

    // 4. Long hair back ponytail if configured
    if (config.hairStyle == "long") {
        val ponytailPath = Path().apply {
            moveTo(scaleX(45f), scaleY(42f))
            cubicTo(scaleX(32f), scaleY(52f), scaleX(34f), scaleY(68f), scaleX(40f), scaleY(74f))
            cubicTo(scaleX(44f), scaleY(74f), scaleX(44f), scaleY(65f), scaleX(48f), scaleY(55f))
            close()
        }
        drawPath(ponytailPath, color = hairColor)
    }

    // 5. Torso / Jersey
    val torsoPath = Path().apply {
        moveTo(scaleX(50f - shoulderWidth / 2f), scaleY(75f))
        cubicTo(
            scaleX(50f - shoulderWidth / 3f), scaleY(70f),
            scaleX(50f + shoulderWidth / 3f), scaleY(70f),
            scaleX(50f + shoulderWidth / 2f), scaleY(75f)
        )
        lineTo(scaleX(50f + torsoWidth / 2f), scaleY(100f))
        lineTo(scaleX(50f - torsoWidth / 2f), scaleY(100f))
        close()
    }
    drawPath(torsoPath, color = outfitColor)

    // Collar neckline
    val collarPath = Path().apply {
        moveTo(scaleX(50f - neckWidth * 0.9f), scaleY(74f))
        quadraticTo(scaleX(50f), scaleY(80f), scaleX(50f + neckWidth * 0.9f), scaleY(74f))
    }
    drawPath(
        collarPath,
        color = skinColor,
        style = Stroke(width = scaleX(3f), cap = StrokeCap.Round)
    )

    // Athletic Jersey Stripe
    drawLine(
        color = Color(0x88FFFFFF),
        start = Offset(scaleX(50f - torsoWidth / 3f), scaleY(85f)),
        end = Offset(scaleX(50f + torsoWidth / 3f), scaleY(85f)),
        strokeWidth = scaleX(2f),
        cap = StrokeCap.Round
    )

    // 6. Head
    drawCircle(
        color = skinColor,
        radius = scaleX(16f),
        center = Offset(scaleX(50f), scaleY(40f))
    )

    // 7. Hair Styles (Short, Long, Curly)
    when (config.hairStyle) {
        "short" -> {
            val hairPath = Path().apply {
                moveTo(scaleX(33f), scaleY(38f))
                cubicTo(scaleX(32f), scaleY(24f), scaleX(68f), scaleY(24f), scaleX(67f), scaleY(38f))
                cubicTo(scaleX(64f), scaleY(33f), scaleX(58f), scaleY(29f), scaleX(50f), scaleY(31f))
                cubicTo(scaleX(42f), scaleY(29f), scaleX(36f), scaleY(33f), scaleX(33f), scaleY(38f))
                close()
            }
            drawPath(hairPath, color = hairColor)
        }
        "long" -> {
            val hairCap = Path().apply {
                moveTo(scaleX(33f), scaleY(38f))
                cubicTo(scaleX(32f), scaleY(24f), scaleX(68f), scaleY(24f), scaleX(67f), scaleY(38f))
                cubicTo(scaleX(64f), scaleY(32f), scaleX(58f), scaleY(28f), scaleX(50f), scaleY(30f))
                cubicTo(scaleX(42f), scaleY(28f), scaleX(36f), scaleY(32f), scaleX(33f), scaleY(38f))
                close()
            }
            drawPath(hairCap, color = hairColor)
        }
        "curly" -> {
            val curls = listOf(
                Pair(34f, 36f), Pair(42f, 27f), Pair(50f, 24f),
                Pair(58f, 27f), Pair(66f, 36f), Pair(36f, 28f), Pair(64f, 28f)
            )
            curls.forEach { (cx, cy) ->
                drawCircle(
                    color = hairColor,
                    radius = scaleX(5.5f),
                    center = Offset(scaleX(cx), scaleY(cy))
                )
            }
        }
    }

    // 8. Face (Eyes & Smile)
    drawCircle(
        color = Color(0xFF1E293B),
        radius = scaleX(2f),
        center = Offset(scaleX(44f), scaleY(40f))
    )
    drawCircle(
        color = Color(0xFF1E293B),
        radius = scaleX(2f),
        center = Offset(scaleX(56f), scaleY(40f))
    )
    val smilePath = Path().apply {
        moveTo(scaleX(45f), scaleY(46f))
        quadraticTo(scaleX(50f), scaleY(51f), scaleX(55f), scaleY(46f))
    }
    drawPath(
        smilePath,
        color = Color(0xFF1E293B),
        style = Stroke(width = scaleX(2f), cap = StrokeCap.Round)
    )

    // 9. Accessories
    when (config.accessory) {
        "helmet" -> {
            // Main helmet dome
            val helmetPath = Path().apply {
                moveTo(scaleX(32f), scaleY(35f))
                cubicTo(scaleX(32f), scaleY(18f), scaleX(68f), scaleY(18f), scaleX(68f), scaleY(35f))
                lineTo(scaleX(68f), scaleY(37f))
                lineTo(scaleX(32f), scaleY(37f))
                close()
            }
            drawPath(helmetPath, color = Color(0xFF1E293B))

            // Helmet stripe
            val stripePath = Path().apply {
                moveTo(scaleX(46f), scaleY(22f))
                cubicTo(scaleX(48f), scaleY(20f), scaleX(52f), scaleY(20f), scaleX(54f), scaleY(22f))
                lineTo(scaleX(54f), scaleY(36f))
                lineTo(scaleX(46f), scaleY(36f))
                close()
            }
            drawPath(stripePath, color = Color(0xFFF97316))

            // Helmet visor rim
            drawLine(
                color = Color(0xFF475569),
                start = Offset(scaleX(31f), scaleY(36f)),
                end = Offset(scaleX(69f), scaleY(36f)),
                strokeWidth = scaleX(3f),
                cap = StrokeCap.Round
            )
            // Strap
            val strapPath = Path().apply {
                moveTo(scaleX(36f), scaleY(40f))
                lineTo(scaleX(50f), scaleY(52f))
                lineTo(scaleX(64f), scaleY(40f))
            }
            drawPath(
                strapPath,
                color = Color(0xFF1E293B),
                style = Stroke(width = scaleX(1.5f))
            )
        }
        "cap" -> {
            // Cap dome
            val capPath = Path().apply {
                moveTo(scaleX(33f), scaleY(36f))
                cubicTo(scaleX(33f), scaleY(22f), scaleX(67f), scaleY(22f), scaleX(67f), scaleY(36f))
                close()
            }
            drawPath(capPath, color = Color(0xFF475569))

            // Cap brim
            val brimPath = Path().apply {
                moveTo(scaleX(30f), scaleY(36f))
                lineTo(scaleX(70f), scaleY(36f))
                lineTo(scaleX(68f), scaleY(39f))
                lineTo(scaleX(32f), scaleY(39f))
                close()
            }
            drawPath(brimPath, color = Color(0xFF334155))

            // Cap badge
            drawCircle(
                color = Color(0xFFF97316),
                radius = scaleX(3f),
                center = Offset(scaleX(50f), scaleY(28f))
            )
        }
        "sunglasses" -> {
            // Left lens
            val leftLens = Path().apply {
                moveTo(scaleX(36f), scaleY(38f))
                lineTo(scaleX(48f), scaleY(38f))
                lineTo(scaleX(46f), scaleY(44f))
                lineTo(scaleX(38f), scaleY(44f))
                close()
            }
            drawPath(leftLens, color = Color(0xFF0F172A))
            drawPath(leftLens, color = Color(0xFFE2E8F0), style = Stroke(scaleX(0.7f)))

            // Right lens
            val rightLens = Path().apply {
                moveTo(scaleX(52f), scaleY(38f))
                lineTo(scaleX(64f), scaleY(38f))
                lineTo(scaleX(62f), scaleY(44f))
                lineTo(scaleX(54f), scaleY(44f))
                close()
            }
            drawPath(rightLens, color = Color(0xFF0F172A))
            drawPath(rightLens, color = Color(0xFFE2E8F0), style = Stroke(scaleX(0.7f)))

            // Nose bridge
            drawRect(
                color = Color(0xFF0F172A),
                topLeft = Offset(scaleX(47f), scaleY(39f)),
                size = Size(scaleX(6f), scaleY(2f))
            )

            // Sport reflective neon streak
            drawLine(
                color = Color(0xFFF97316),
                start = Offset(scaleX(38f), scaleY(42f)),
                end = Offset(scaleX(46f), scaleY(39f)),
                strokeWidth = scaleX(1f)
            )
            drawLine(
                color = Color(0xFFF97316),
                start = Offset(scaleX(54f), scaleY(39f)),
                end = Offset(scaleX(62f), scaleY(42f)),
                strokeWidth = scaleX(1f)
            )
        }
        "headband" -> {
            // Headband strap
            val bandPath = Path().apply {
                moveTo(scaleX(33f), scaleY(32f))
                lineTo(scaleX(67f), scaleY(32f))
                lineTo(scaleX(66f), scaleY(36f))
                lineTo(scaleX(34f), scaleY(36f))
                close()
            }
            drawPath(bandPath, color = Color(0xFFF97316))

            // Front badge
            drawRoundRect(
                color = Color.White,
                topLeft = Offset(scaleX(47f), scaleY(33f)),
                size = Size(scaleX(6f), scaleY(2.5f)),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(scaleX(1f), scaleY(1f))
            )
        }
    }
}
