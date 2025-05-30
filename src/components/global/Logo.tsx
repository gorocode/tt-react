/**
 * Logo.tsx
 * 
 * App logo component that renders a scalable SVG logo using the theme's accent color
 * Includes hover animation using motion.js for enhanced interactivity
 */

// Animation library
import { motion } from "motion/react"

// Context
import { useTheme } from "../../context/ThemeContext";

/**
 * Props for the Logo component
 * 
 * @interface LogoProps
 * @property {number} width - The width of the logo in pixels (height will match width to maintain aspect ratio)
 */
interface LogoProps {
    width: number;
}

/**
 * Logo component that displays the application logo
 * 
 * Features:
 * - Responsive sizing based on the width prop
 * - Uses the current theme's accent color
 * - Includes hover animation for better user experience
 * - Maintains aspect ratio regardless of size
 * 
 * @param {LogoProps} props - Component props
 * @returns {JSX.Element} - Rendered logo component
 */
const Logo = ({width}: LogoProps) => {
    // Get theme colors from context
    const { themeColors } = useTheme();

    return (
        <motion.svg
            // Dimensions - height matches width to maintain aspect ratio
            width={width} 
            height={width}
            viewBox="0 0 640.000000 640.000000"            
            fill="none"
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            // Styling and animations
            style={{ fill: themeColors.accent }}
            whileHover={{ scale: 1.05 }} // Subtle enlargement on hover
            transition={{ duration: 0.2 }} // Quick, smooth animation
            preserveAspectRatio="xMidYMid meet" // Maintain aspect ratio on resize
        >
            {/* Main logo path group with theme-based coloring */}
            <g transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)"
                fill={themeColors.accent}  stroke="none">
                <path d="M3000 5483 c-264 -21 -589 -115 -843 -244 -611 -309 -1061 -896
                    -1201 -1567 -39 -188 -50 -295 -49 -492 0 -364 77 -680 247 -1014 142 -280
                    368 -559 614 -757 244 -197 561 -355 867 -434 220 -56 324 -69 570 -70 230 0
                    313 8 510 51 687 151 1276 612 1581 1239 151 310 222 597 231 933 8 273 -17
                    470 -92 726 -168 576 -612 1108 -1153 1382 -261 132 -531 213 -814 243 -90 10
                    -364 12 -468 4z m410 -93 c225 -20 442 -71 647 -154 154 -62 240 -107 383
                    -201 457 -300 780 -740 924 -1260 87 -312 100 -687 35 -1003 -80 -397 -266
                    -757 -545 -1060 -362 -392 -797 -615 -1369 -703 -121 -19 -437 -16 -579 5
                    -487 71 -926 293 -1271 641 -546 552 -760 1322 -574 2070 75 300 237 622 438
                    870 212 261 524 495 834 624 345 143 717 202 1077 171z"/>
                <path d="M3025 5344 c-16 -3 -77 -11 -135 -19 -945 -133 -1691 -882 -1826
                    -1835 -22 -154 -22 -458 0 -600 58 -371 198 -701 424 -1000 72 -94 285 -310
                    377 -381 313 -242 632 -380 1030 -445 153 -25 486 -25 640 0 462 75 844 259
                    1165 561 317 299 523 644 624 1046 48 188 66 337 66 532 -1 576 -206 1072
                    -620 1501 -232 240 -535 427 -875 541 -203 68 -380 96 -635 100 -113 2 -218 1
                    -235 -1z m221 -279 c16 -40 19 -85 4 -85 -7 0 -10 -86 -8 -259 2 -143 0 -262
                    -3 -265 -3 -4 -14 -4 -23 0 -15 6 -16 31 -14 265 2 143 0 259 -4 259 -13 0 -9
                    48 6 85 8 19 18 35 21 35 3 0 13 -16 21 -35z m-243 -63 c15 -21 26 -50 26 -67
                    -1 -17 26 -119 60 -229 69 -224 76 -261 47 -261 -24 0 -33 24 -98 275 -28 110
                    -56 198 -64 203 -16 9 -20 117 -5 117 4 0 20 -17 34 -38z m489 -9 c2 -35 -1
                    -52 -13 -64 -9 -9 -21 -37 -27 -60 -21 -94 -93 -344 -112 -385 -17 -40 -41
                    -56 -53 -36 -5 8 13 71 85 292 27 85 54 160 59 167 7 7 6 18 -2 31 -11 18 -9
                    26 15 61 16 23 32 41 36 41 5 0 10 -21 12 -47z m-724 -45 c6 -17 11 -32 9 -33
                    -1 -1 -58 -21 -127 -44 -389 -132 -686 -360 -917 -706 -186 -278 -279 -572
                    -290 -920 -6 -191 8 -324 54 -500 150 -578 621 -1064 1203 -1243 179 -55 272
                    -67 515 -67 204 0 242 3 335 23 351 78 614 213 882 451 41 35 182 199 226 261
                    246 345 359 752 324 1164 -15 172 -32 256 -82 406 -131 396 -379 715 -733 945
                    -106 68 -281 152 -397 190 -47 15 -87 29 -88 31 -2 1 1 18 7 37 l12 35 74 -24
                    c489 -155 916 -538 1128 -1011 188 -418 214 -874 75 -1302 -98 -302 -250 -544
                    -484 -772 -497 -481 -1226 -644 -1878 -419 -122 42 -296 127 -401 195 -230
                    151 -450 376 -585 600 -126 210 -201 410 -246 655 -22 121 -25 425 -5 555 105
                    685 590 1268 1236 1485 66 22 125 40 130 40 6 0 16 -14 23 -32z m183 -325
                    c133 -201 134 -203 117 -203 -7 0 -35 35 -62 78 -74 114 -176 282 -176 287 0
                    17 23 -14 121 -162z m665 152 c-18 -47 -225 -365 -238 -365 -17 0 -4 24 115
                    203 107 161 139 203 123 162z m-793 -293 c12 -10 57 -40 100 -66 42 -27 77
                    -52 77 -57 0 -26 -37 -16 -119 30 -50 28 -94 51 -99 51 -11 0 -62 53 -62 64 0
                    15 82 -2 103 -22z m907 20 c0 -17 -48 -51 -153 -107 -96 -51 -137 -62 -137
                    -38 0 5 30 26 66 48 36 22 84 54 107 72 29 22 54 32 80 32 20 1 37 -3 37 -7z
                    m-425 -168 c38 -18 74 -63 53 -65 -7 -1 -73 -2 -145 -3 -136 -1 -152 4 -115
                    36 54 48 144 62 207 32z m-370 -44 c4 -7 -68 -10 -210 -10 -142 0 -214 3 -210
                    10 4 6 85 10 210 10 125 0 206 -4 210 -10z m1001 -1 c3 -5 -94 -9 -216 -9
                    -153 0 -219 3 -215 11 8 13 423 11 431 -2z m-696 -510 l0 -141 30 26 c83 69
                    206 53 273 -36 37 -50 50 -102 45 -182 -9 -136 -81 -215 -206 -224 -69 -4
                    -108 6 -159 44 -22 16 -23 15 -33 -10 -9 -24 -14 -26 -66 -26 -54 0 -56 1 -48
                    23 10 26 18 537 9 584 -4 24 -13 35 -30 39 -15 4 -25 13 -25 25 0 16 10 19 98
                    21 53 2 100 2 105 0 4 -2 7 -66 7 -143z m630 -164 l0 -305 24 -15 c15 -10 40
                    -15 68 -13 38 3 45 7 63 40 27 52 50 51 41 -1 -3 -22 -10 -51 -16 -66 l-10
                    -25 -187 2 c-137 2 -187 6 -190 15 -3 7 7 18 20 24 34 15 37 41 37 327 0 229
                    -1 243 -20 262 -11 11 -24 20 -30 20 -5 0 -10 9 -10 20 0 19 7 20 105 20 l105
                    0 0 -305z m-1410 206 c0 -71 -3 -90 -16 -95 -15 -6 -24 10 -55 92 -8 20 -15
                    22 -73 22 l-65 0 -3 -247 c-4 -312 -5 -299 38 -313 23 -8 34 -18 34 -31 0 -19
                    -7 -19 -157 -17 -136 3 -158 5 -161 19 -2 11 6 19 25 24 54 13 53 7 53 303 l0
                    275 -46 -7 c-26 -3 -55 -6 -66 -6 -14 0 -26 -16 -43 -54 -45 -101 -68 -86 -59
                    37 l7 87 293 0 294 0 0 -89z m380 -139 c19 -9 45 -32 57 -51 21 -31 23 -45 23
                    -173 0 -160 7 -183 51 -173 35 8 37 -4 5 -34 -49 -46 -159 -37 -186 14 l-13
                    24 -38 -31 c-30 -24 -52 -32 -92 -36 -104 -8 -173 49 -164 138 8 77 78 118
                    230 135 l57 6 0 50 c0 87 -47 137 -101 109 -16 -9 -19 -17 -13 -45 13 -70 -27
                    -106 -92 -85 -62 21 -63 108 -1 142 72 39 207 44 277 10z m1570 17 c25 -5 60
                    -20 77 -32 43 -29 83 -104 83 -156 l0 -41 -156 0 -157 0 7 -42 c15 -95 73
                    -143 160 -134 34 4 61 15 86 35 25 20 41 26 51 21 18 -12 -10 -51 -69 -93 -38
                    -27 -54 -32 -118 -35 -84 -5 -144 12 -195 55 -86 73 -103 221 -36 320 40 58
                    72 82 134 99 59 16 76 16 133 3z m-923 -939 c3 -297 3 -305 24 -322 12 -10 37
                    -18 55 -18 29 0 38 6 55 35 12 19 27 35 35 35 17 0 17 4 -2 -59 l-15 -53 -171
                    6 c-94 3 -174 9 -177 12 -3 3 5 14 19 24 l25 19 3 263 c2 144 1 272 -2 284 -3
                    11 -17 26 -31 32 -14 6 -25 18 -25 26 0 16 56 24 155 22 l50 -1 2 -305z m403
                    95 c0 -118 4 -215 9 -215 5 0 38 31 75 70 58 62 65 73 60 100 l-6 30 101 0
                    c94 0 101 -1 101 -20 0 -16 -7 -20 -30 -20 -42 0 -77 -20 -127 -72 l-43 -43
                    83 -122 c64 -95 89 -125 115 -135 54 -20 38 -42 -33 -46 -124 -7 -132 -3 -205
                    106 -82 122 -96 127 -99 34 -1 -53 2 -74 14 -86 9 -9 21 -16 26 -16 5 0 9 -8
                    9 -18 0 -16 -11 -18 -117 -17 -102 0 -118 2 -121 17 -2 9 5 19 17 23 21 6 21
                    13 21 291 l0 285 -30 17 c-61 35 -37 44 128 50 l52 2 0 -215z m-1132 108 c-4
                    -107 -19 -116 -59 -32 l-27 56 -58 6 c-32 3 -61 4 -64 1 -8 -8 -13 -480 -5
                    -520 5 -28 13 -39 35 -47 49 -19 44 -34 -13 -40 -103 -9 -260 -3 -265 11 -2 7
                    9 17 27 23 17 6 36 19 41 29 6 11 10 131 10 285 0 240 -2 267 -16 261 -9 -3
                    -37 -6 -64 -6 l-47 0 -26 -60 c-26 -58 -52 -78 -59 -44 -2 9 -2 49 0 90 l4 74
                    294 0 295 0 -3 -87z m343 -139 c62 -37 73 -70 79 -239 l5 -150 32 2 c26 2 30
                    0 26 -16 -17 -66 -203 -61 -203 6 0 19 -14 16 -36 -8 -90 -101 -274 -38 -261
                    89 8 75 65 113 198 132 40 6 78 15 82 19 15 15 -3 111 -24 132 -19 19 -45 24
                    -73 13 -12 -5 -16 -20 -16 -59 0 -49 -2 -53 -31 -65 -26 -11 -36 -11 -63 3
                    -71 34 -49 117 39 149 67 25 197 20 246 -8z m75 -729 c8 -43 21 -46 22 -4 1
                    43 12 50 13 8 l1 -34 13 35 13 35 1 -38 c1 -43 16 -42 26 3 4 17 11 30 17 30
                    12 0 4 -43 -23 -123 -10 -31 -19 -70 -19 -86 0 -34 -18 -51 -31 -30 -5 8 -9
                    30 -9 49 0 19 -7 49 -16 65 -18 35 -35 125 -23 125 4 0 11 -16 15 -35z m-188
                    -50 c6 -3 12 -11 12 -19 0 -20 -96 -24 -275 -13 -139 9 -154 11 -142 23 15 15
                    361 22 405 9z m790 -1 c39 -3 72 -9 72 -14 0 -11 -183 -22 -305 -18 -84 3
                    -100 6 -103 20 -3 14 7 18 55 21 62 3 161 0 281 -9z"/>
                <path d="M3277 3612 c-28 -31 -37 -71 -37 -168 0 -99 14 -146 45 -158 25 -9
                    64 -7 86 4 67 37 79 251 17 318 -27 28 -87 30 -111 4z"/>
                <path d="M2710 3449 c-45 -18 -70 -50 -70 -89 0 -67 59 -92 105 -45 21 20 25
                    34 25 85 0 65 -6 70 -60 49z"/>
                <path d="M4295 3636 c-16 -24 -35 -81 -35 -103 0 -9 23 -13 81 -13 l82 0 -7
                    47 c-9 67 -29 93 -71 93 -25 0 -39 -6 -50 -24z"/>
                <path d="M2972 2600 c-62 -15 -90 -63 -70 -121 12 -35 40 -45 79 -29 32 14 42
                    39 43 109 1 49 -4 52 -52 41z"/>
            </g>
        </motion.svg>
    )
}

export default Logo;