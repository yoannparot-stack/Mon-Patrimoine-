from pathlib import Path
import sys
root=Path(sys.argv[1]);java=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=java.read_text()
anchor='        webView.setBackgroundColor(Color.WHITE);'
assert anchor in s
s=s.replace(anchor,anchor+'''
        // Debugging is restricted to debuggable APKs; used by the emulator QA job.
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        getWindow().setStatusBarColor(Color.WHITE);
        getWindow().setNavigationBarColor(Color.WHITE);
        int lightBars = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (android.os.Build.VERSION.SDK_INT >= 26) lightBars |= android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        getWindow().getDecorView().setSystemUiVisibility(lightBars);
        webView.setOnApplyWindowInsetsListener((view, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });''',1)
a=s.index('    @Override public void onBackPressed() {');b=s.index('\n    }',a)+6
s=s[:a]+'''    @Override public void onBackPressed() {
        if (webView == null) { super.onBackPressed(); return; }
        webView.evaluateJavascript("typeof immoptimaHandleBack==='function' && immoptimaHandleBack()", result -> {
            if (!"true".equals(result)) {
                if (webView.canGoBack()) webView.goBack(); else MainActivity.super.onBackPressed();
            }
        });
    }'''+s[b:]
java.write_text(s)
print('ImmOptima native insets and Back navigation installed')
