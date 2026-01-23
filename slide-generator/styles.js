// styles.js
// CSS generation for presentations

const CSS_STYLES = `
        :root {
            --gl-orange: #FC6D26;
            --gl-orange-dark: #E24329;
            --gl-orange-light: #FCA326;
            --gl-dark: #171321;
            --gl-gray-900: #1F1A24;
            --gl-gray-800: #2E2A35;
            --gl-gray-700: #3F3A47;
            --gl-gray-600: #525059;
            --gl-gray-500: #737278;
            --gl-gray-400: #9A99A0;
            --gl-gray-300: #BFBFC3;
            --gl-gray-200: #DCDCDE;
            --gl-gray-100: #ECECEF;
            --gl-gray-50: #FAFAFA;
            --gl-white: #FFFFFF;
            --gl-purple: #6B4FBB;
            --gl-purple-light: #9475DB;
            --gl-blue: #1F75CB;
            --gl-blue-light: #428FDC;
            --gl-green: #108548;
            --gl-green-light: #2DA160;
            --gl-red: #DD2B0E;
            --gl-yellow: #F5D423;
            --gl-gradient-primary: linear-gradient(135deg, #FC6D26 0%, #E24329 50%, #FCA326 100%);
            --gl-gradient-dark: linear-gradient(135deg, #171321 0%, #2E2A35 100%);
            --gl-gradient-purple: linear-gradient(135deg, #6B4FBB 0%, #9475DB 100%);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #E8E6E3;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .presentation-container {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #E8E6E3;
            padding: 60px 20px;
            gap: 60px;
        }

        .slide-wrapper {
            width: 100%;
            max-width: 1280px;
            aspect-ratio: 16 / 9;
            position: relative;
            flex-shrink: 0;
        }

        .slide {
            width: 1280px;
            height: 720px;
            position: absolute;
            top: 0;
            left: 0;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border-radius: 12px;
            transform-origin: top left;
        }

        /* Template: Title */
        .template-title {
            background: var(--gl-gradient-dark);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px;
        }
        .template-title::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -30%;
            width: 800px;
            height: 800px;
            background: var(--gl-gradient-primary);
            border-radius: 50%;
            opacity: 0.1;
            filter: blur(100px);
        }
        .template-title .logo { width: 80px; height: 80px; margin-bottom: 40px; }
        .template-title h1 {
            font-size: 56px;
            font-weight: 800;
            color: var(--gl-white);
            margin-bottom: 20px;
            line-height: 1.1;
            max-width: 900px;
        }
        .template-title .subtitle {
            font-size: 24px;
            font-weight: 400;
            color: var(--gl-gray-300);
            margin-bottom: 40px;
        }
        .template-title .author { font-size: 18px; color: var(--gl-orange); font-weight: 500; }
        .template-title .date { font-size: 16px; color: var(--gl-gray-500); margin-top: 10px; }

        /* Template: Section */
        .template-section {
            background: var(--gl-gradient-primary);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 80px;
        }
        .template-section::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 400px;
            height: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            transform: translate(30%, 30%);
        }
        .template-section .section-number {
            font-size: 120px;
            font-weight: 800;
            color: rgba(255,255,255,0.2);
            position: absolute;
            top: 40px;
            right: 60px;
        }
        .template-section h2 {
            font-size: 64px;
            font-weight: 800;
            color: var(--gl-white);
            max-width: 800px;
            line-height: 1.1;
        }
        .template-section .section-subtitle {
            font-size: 24px;
            color: rgba(255,255,255,0.8);
            margin-top: 20px;
            max-width: 600px;
        }
        .template-section .logo-container {
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }
        .template-section .logo {
            max-width: 300px;
            max-height: 60px;
            height: 60px;
            width: auto;
            object-fit: contain;
            display: block;
        }
        .template-section .logo-container svg {
            height: 60px;
            width: auto;
        }

        /* Template: Bullets */
        .template-bullets {
            background: var(--gl-white);
            padding: 60px 80px;
            display: flex;
            flex-direction: column;
        }
        .template-bullets .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid var(--gl-orange);
        }
        .template-bullets h2 { font-size: 42px; font-weight: 700; color: var(--gl-dark); }
        .template-bullets .slide-tag {
            background: var(--gl-gradient-primary);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .template-bullets .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .template-bullets ul { list-style: none; }
        .template-bullets li {
            font-size: 26px;
            color: var(--gl-gray-800);
            margin-bottom: 28px;
            padding-left: 50px;
            position: relative;
            line-height: 1.4;
        }
        .template-bullets li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 12px;
            width: 24px;
            height: 24px;
            background: var(--gl-gradient-primary);
            border-radius: 6px;
            transform: rotate(45deg);
        }
        .template-bullets li[data-level="1"] { margin-left: 40px; font-size: 24px; }
        .template-bullets li[data-level="1"]::before { width: 18px; height: 18px; top: 10px; border-radius: 50%; transform: none; }
        .template-bullets li[data-level="2"] { margin-left: 80px; font-size: 22px; }
        .template-bullets li[data-level="2"]::before { width: 14px; height: 14px; top: 10px; border-radius: 0; opacity: 0.8; }
        .template-bullets li[data-level="3"] { margin-left: 120px; font-size: 20px; }
        .template-bullets li[data-level="3"]::before { width: 10px; height: 10px; top: 10px; border-radius: 50%; transform: none; opacity: 0.6; }

        /* Template: Two Columns */
        .template-two-columns {
            background: var(--gl-gray-50);
            padding: 60px 80px;
        }
        .template-two-columns h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid var(--gl-orange);
        }
        .template-two-columns .columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            height: calc(100% - 120px);
        }
        .template-two-columns .column { display: flex; flex-direction: column; }
        .template-two-columns .column h3 {
            font-size: 28px;
            font-weight: 600;
            color: var(--gl-purple);
            margin-bottom: 24px;
        }
        .template-two-columns .column p {
            font-size: 20px;
            color: var(--gl-gray-700);
            line-height: 1.6;
        }
        .template-two-columns .column ul { list-style: none; }
        .template-two-columns .column li {
            font-size: 20px;
            color: var(--gl-gray-700);
            margin-bottom: 16px;
            padding-left: 30px;
            position: relative;
        }
        .template-two-columns .column li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--gl-orange);
            font-weight: bold;
        }

        /* Template: Image + Text */
        .template-image-text {
            background: var(--gl-white);
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
        .template-image-text .image-container {
            background: var(--gl-gray-200);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .template-image-text .image-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .template-image-text .image-placeholder {
            width: 200px;
            height: 200px;
            background: var(--gl-gradient-primary);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 60px;
        }
        .template-image-text .text-container {
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .template-image-text h2 {
            font-size: 38px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 24px;
        }
        .template-image-text .text-content {
            font-size: 20px;
            color: var(--gl-gray-700);
            line-height: 1.7;
        }
        .template-image-text .text-content p {
            margin-bottom: 16px;
        }
        .template-image-text .text-content p:last-child {
            margin-bottom: 0;
        }
        .template-image-text .text-content strong {
            font-weight: 700;
        }
        .template-image-text .text-content em {
            font-style: italic;
        }
        .template-image-text .text-content u {
            text-decoration: underline;
        }
        .template-image-text .text-content ul,
        .template-image-text .text-content ol {
            list-style: none;
            margin-bottom: 16px;
        }
        .template-image-text .text-content li {
            margin-bottom: 12px;
            padding-left: 30px;
            position: relative;
        }
        .template-image-text .text-content ul li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
            width: 12px;
            height: 12px;
            background: var(--gl-gradient-primary);
            border-radius: 3px;
            transform: rotate(45deg);
        }
        .template-image-text .text-content ol {
            counter-reset: list-counter;
        }
        .template-image-text .text-content ol li {
            counter-increment: list-counter;
        }
        .template-image-text .text-content ol li::before {
            content: counter(list-counter) '.';
            position: absolute;
            left: 0;
            top: 0;
            font-weight: 700;
            color: var(--gl-orange);
        }
        .template-image-text .text-content a {
            color: var(--gl-orange);
            text-decoration: underline;
        }

        /* Template: Quote */
        .template-quote {
            background: var(--gl-gradient-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px;
            position: relative;
        }
        .template-quote::before {
            content: '"';
            position: absolute;
            top: 60px;
            left: 80px;
            font-size: 300px;
            font-weight: 800;
            color: var(--gl-orange);
            opacity: 0.15;
            line-height: 1;
        }
        .template-quote .quote-content {
            max-width: 900px;
            text-align: center;
            z-index: 1;
        }
        .template-quote blockquote {
            font-size: 36px;
            font-weight: 500;
            color: var(--gl-white);
            line-height: 1.5;
            font-style: italic;
            margin-bottom: 40px;
        }
        .template-quote .author {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        .template-quote .author-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--gl-gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 20px;
        }
        .template-quote .author-info { text-align: left; }
        .template-quote .author-name { font-size: 20px; font-weight: 600; color: var(--gl-orange); }
        .template-quote .author-title { font-size: 16px; color: var(--gl-gray-400); }

        /* Template: Stats */
        .template-stats {
            background: var(--gl-gradient-dark);
            padding: 60px 80px;
        }
        .template-stats h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-white);
            margin-bottom: 60px;
            text-align: center;
        }
        .template-stats .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
        }
        .template-stats .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
        }
        .template-stats .stat-value {
            font-size: 64px;
            font-weight: 800;
            background: var(--gl-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
        }
        .template-stats .stat-label {
            font-size: 20px;
            color: var(--gl-gray-300);
            font-weight: 500;
        }
        .template-stats .stat-change {
            font-size: 14px;
            margin-top: 12px;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }
        .template-stats .stat-change.positive { background: rgba(16, 133, 72, 0.2); color: var(--gl-green-light); }
        .template-stats .stat-change.negative { background: rgba(221, 43, 14, 0.2); color: var(--gl-red); }

        /* Template: Code */
        .template-code {
            background: var(--gl-gradient-dark);
            padding: 50px 60px;
        }
        .template-code h2 {
            font-size: 36px;
            font-weight: 700;
            color: var(--gl-white);
            margin-bottom: 30px;
        }
        .template-code .code-container {
            background: #252030;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        .template-code .code-header {
            background: var(--gl-gray-800);
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .template-code .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code .code-dot.red { background: #FF5F56; }
        .template-code .code-dot.yellow { background: #FFBD2E; }
        .template-code .code-dot.green { background: #27CA40; }
        .template-code .code-filename { margin-left: 16px; color: var(--gl-gray-400); font-size: 14px; }
        .template-code pre {
            padding: 30px;
            overflow-x: auto;
            font-family: 'JetBrains Mono', monospace;
            font-size: 16px;
            line-height: 1.6;
        }
        .template-code code { color: var(--gl-gray-200); }
        .template-code .code-description {
            margin-top: 30px;
            color: var(--gl-gray-400);
            font-size: 18px;
            line-height: 1.6;
            position: relative;
            z-index: 1;
        }

        /* Template: Code Annotated */
        .template-code-annotated {
            background: var(--gl-gradient-dark);
            padding: 40px 50px;
        }
        .template-code-annotated h2 {
            font-size: 32px;
            font-weight: 700;
            color: var(--gl-white);
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
        }
        .template-code-annotated .code-annotated-container {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 30px;
            height: calc(100% - 80px);
        }
        .template-code-annotated .code-panel {
            display: flex;
            flex-direction: column;
        }
        .template-code-annotated .code-container {
            background: #252030;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 1;
        }
        .template-code-annotated .code-header {
            background: var(--gl-gray-800);
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .template-code-annotated .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code-annotated .code-dot.red { background: #FF5F56; }
        .template-code-annotated .code-dot.yellow { background: #FFBD2E; }
        .template-code-annotated .code-dot.green { background: #27CA40; }
        .template-code-annotated .code-filename { margin-left: 16px; color: var(--gl-gray-400); font-size: 14px; }
        .template-code-annotated .code-body {
            padding: 16px 0;
            overflow-y: auto;
            flex: 1;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            line-height: 28px;
        }
        .template-code-annotated .code-line {
            display: flex;
            padding: 0 20px;
            border-left: 3px solid transparent;
        }
        .template-code-annotated .code-line:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .template-code-annotated .code-line.highlighted {
            background: rgba(252, 109, 38, 0.15);
            border-left-color: var(--gl-orange);
        }
        .template-code-annotated .code-line.highlighted .line-number {
            color: var(--gl-orange);
        }
        .template-code-annotated .code-line.ellipsis {
            opacity: 0.5;
        }
        .template-code-annotated .code-line.ellipsis .line-number {
            color: var(--gl-gray-500);
            font-style: italic;
        }
        .template-code-annotated .line-number {
            color: var(--gl-gray-600);
            width: 40px;
            flex-shrink: 0;
            text-align: right;
            padding-right: 16px;
            user-select: none;
        }
        .template-code-annotated .line-content {
            color: var(--gl-gray-200);
            white-space: pre;
        }
        .template-code-annotated .annotations-panel {
            position: relative;
            padding-top: 52px;
            z-index: 1;
        }
        .template-code-annotated .annotation {
            position: absolute;
            left: 0;
            right: 0;
            display: flex;
            align-items: flex-start;
            gap: 0;
        }
        .template-code-annotated .annotation-arrow {
            width: 24px;
            height: 28px;
            position: relative;
            flex-shrink: 0;
        }
        .template-code-annotated .annotation-arrow::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            width: 16px;
            height: 2px;
            background: var(--gl-orange);
            transform: translateY(-50%);
        }
        .template-code-annotated .annotation-arrow::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 10px;
            width: 0;
            height: 0;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-left: 8px solid var(--gl-orange);
            transform: translateY(-50%);
        }
        .template-code-annotated .annotation-content {
            background: rgba(252, 109, 38, 0.1);
            border: 1px solid rgba(252, 109, 38, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            flex: 1;
        }
        .template-code-annotated .annotation-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--gl-orange);
            margin-bottom: 6px;
        }
        .template-code-annotated .annotation-text {
            font-size: 13px;
            color: var(--gl-gray-300);
            line-height: 1.5;
        }

        /* Template: Timeline */
        .template-timeline {
            background: var(--gl-white);
            padding: 60px 80px;
        }
        .template-timeline h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 60px;
            text-align: center;
        }
        .template-timeline .timeline-wrapper {
            flex: 1;
            position: relative;
        }
        .template-timeline .timeline-line {
            position: absolute;
            top: 40px;
            height: 4px;
            background: var(--gl-gray-200);
            z-index: 0;
        }
        .template-timeline .timeline {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
        }
        .template-timeline .timeline-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 1;
            position: relative;
            z-index: 1;
        }
        .template-timeline .timeline-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--gl-gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 24px;
            box-shadow: 0 10px 30px rgba(252, 109, 38, 0.3);
            position: relative;
            z-index: 2;
        }
        .template-timeline .timeline-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--gl-dark);
            margin-bottom: 12px;
        }
        .template-timeline .timeline-desc {
            font-size: 16px;
            color: var(--gl-gray-600);
            line-height: 1.5;
        }

        /* Template: Comparison */
        .template-comparison {
            background: var(--gl-gray-50);
            padding: 60px 80px;
        }
        .template-comparison h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 40px;
            text-align: center;
        }
        .template-comparison table {
            width: 100%;
            border-collapse: collapse;
            background: var(--gl-white);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .template-comparison thead { background: var(--gl-gradient-dark); }
        .template-comparison th {
            padding: 24px 30px;
            text-align: left;
            color: var(--gl-white);
            font-weight: 600;
            font-size: 18px;
        }
        .template-comparison th:first-child { border-radius: 16px 0 0 0; }
        .template-comparison th:last-child { border-radius: 0 16px 0 0; }
        .template-comparison th.highlight-col { background: var(--gl-gradient-primary); }
        .template-comparison td {
            padding: 20px 30px;
            font-size: 17px;
            color: var(--gl-gray-700);
            border-bottom: 1px solid var(--gl-gray-100);
        }
        .template-comparison tr:last-child td { border-bottom: none; }
        .template-comparison td.highlight-col { background: rgba(252, 109, 38, 0.05); font-weight: 500; }
        .template-comparison .check { color: var(--gl-green); font-size: 24px; }
        .template-comparison .cross { color: var(--gl-red); font-size: 24px; }

        /* Template: Mermaid */
        .template-mermaid {
            background: var(--gl-white);
            padding: 50px 60px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .template-mermaid h2 {
            font-size: 36px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 16px;
            flex-shrink: 0;
        }
        .template-mermaid .mermaid-description {
            font-size: 18px;
            color: var(--gl-gray-600);
            margin-bottom: 24px;
            line-height: 1.5;
            flex-shrink: 0;
        }
        .template-mermaid .mermaid-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gl-gray-100);
            border-radius: 16px;
            padding: 30px;
            overflow: hidden;
            min-height: 0;
            position: relative;
        }
        .template-mermaid .mermaid {
            font-family: 'Inter', sans-serif;
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .template-mermaid .mermaid svg {
            max-width: 100%;
            max-height: 100%;
            width: auto !important;
            height: auto !important;
        }

        /* Template: Draw.io */
        .template-drawio {
            background: var(--gl-white);
            padding: 50px 60px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .template-drawio h2 {
            font-size: 36px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 16px;
            flex-shrink: 0;
        }
        .template-drawio .drawio-description {
            font-size: 18px;
            color: var(--gl-gray-600);
            margin-bottom: 24px;
            line-height: 1.5;
            flex-shrink: 0;
        }
        .template-drawio .drawio-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            overflow: hidden;
            min-height: 0;
        }
        .template-drawio .drawio-placeholder {
            color: var(--gl-gray-400);
            text-align: center;
        }
        .template-drawio .drawio-placeholder svg {
            width: 64px;
            height: 64px;
            margin-bottom: 12px;
            opacity: 0.5;
        }
        .template-drawio .drawio-placeholder p {
            font-size: 16px;
        }
        .template-drawio img.drawio-svg {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            color-scheme: light only;
        }
`;

module.exports = { CSS_STYLES };
