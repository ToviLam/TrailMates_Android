package com.example.trailmates.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = BrandGreen,
    onPrimary = BgBase,
    primaryContainer = SurfaceDark2,
    onPrimaryContainer = BrandGreen,
    secondary = BrandBlue,
    onSecondary = BgBase,
    secondaryContainer = SurfaceDark2,
    onSecondaryContainer = BrandBlue,
    tertiary = BrandAccent,
    background = BgBase,
    surface = SurfaceDark,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceDark2,
    onSurfaceVariant = TextSecondary,
    outline = SurfaceBorder
)

@Composable
fun TrailMatesTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = BgBase.toArgb()
            window.navigationBarColor = BgBase.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
