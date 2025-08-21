# Meiso - デプロイメントガイド

このドキュメントでは、Meisoアプリケーションの本番環境へのデプロイとモニタリング設定について説明します。

## 🚀 Vercelへのデプロイ

### 前提条件

- [Vercel](https://vercel.com/)アカウント
- [Supabase](https://supabase.com/)プロジェクト（本番用）
- [Sentry](https://sentry.io/)プロジェクト（エラー監視用）
- GitHubリポジトリ

### 1. Vercelプロジェクトの作成

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトディレクトリで実行
cd meiso
vercel

# 初回デプロイ時の設定
# ? What's your project's name? meiso
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] y
```

### 2. 環境変数の設定

Vercelダッシュボードの「Settings > Environment Variables」で以下を設定：

#### 必須環境変数

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Sentry設定（エラー監視）
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Vercel設定
NEXT_PUBLIC_VERCEL_URL=your-domain.vercel.app
```

#### 開発環境の環境変数

`.env.local`ファイルを作成（Gitにはコミットしない）：

```bash
# 開発用Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# 開発用Sentry（オプション）
SENTRY_DSN=your-dev-sentry-dsn
```

### 3. カスタムドメインの設定

1. Vercelダッシュボードで「Settings > Domains」
2. カスタムドメインを追加
3. DNSレコードを設定
4. SSL証明書の自動発行を確認

## 📊 モニタリング設定

### Sentryエラー監視

1. [Sentry](https://sentry.io/)でプロジェクト作成
2. DSN、ORG、PROJECT IDを取得
3. Vercelの環境変数に設定
4. エラー通知の設定

#### Sentryアラート設定

- **エラー率アラート**: 5分間で10件以上のエラー
- **パフォーマンスアラート**: レスポンス時間95パーセンタイルが3秒以上
- **通知先**: Slack, Email, Discord

### Vercel Analytics

自動的に有効化されるWebVitals監視：

- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTFB (Time to First Byte)**: < 800ms

### カスタムメトリクス

アプリケーション固有のメトリクスを追跡：

```typescript
// 瞑想セッション完了率
trackMeditationPerformance({
  duration: 60,
  scriptId: 'basic-breathing',
  completed: true,
  loadTime: 1200
});

// カスタムメトリクス
trackCustomMetric('meditation_session_duration', sessionDuration);
trackCustomMetric('audio_load_time', audioLoadTime);
```

## 🗄️ データベース設定

### Supabase本番環境

1. **新しいSupabaseプロジェクト作成**
   - 地域: Asia Northeast (Tokyo)
   - プラン: Pro（本番用）

2. **データベーススキーマの設定**

   ```sql
   -- ユーザープロフィール
   CREATE TABLE user_profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     preferences JSONB DEFAULT '{}'::jsonb,
     PRIMARY KEY (id)
   );

   -- 瞑想セッション履歴
   CREATE TABLE meditation_sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
     script_id TEXT NOT NULL,
     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
     end_time TIMESTAMP WITH TIME ZONE,
     completed BOOLEAN DEFAULT false,
     duration INTEGER NOT NULL,
     device_info JSONB DEFAULT '{}'::jsonb,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

3. **Row Level Security (RLS)の設定**

   ```sql
   -- user_profilesのRLS
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own profile" ON user_profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile" ON user_profiles
     FOR UPDATE USING (auth.uid() = id);

   -- meditation_sessionsのRLS
   ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own sessions" ON meditation_sessions
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own sessions" ON meditation_sessions
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

4. **バックアップとスケーリング設定**
   - 自動バックアップ: 毎日3:00 JST
   - Point-in-time復旧: 7日間
   - 読み取りレプリカ: 必要に応じて設定

## 🔄 CI/CDパイプライン

### GitHub Actions設定

`.github/workflows/ci.yml`で自動デプロイ設定済み：

#### ワークフロー概要

1. **テストスイート** (`test`ジョブ)
   - TypeScript型チェック
   - ESLintによるコード品質チェック
   - Jest単体テスト (カバレッジ付き)
   - Playwright E2Eテスト
   - アクセシビリティテスト

2. **ビルド** (`build`ジョブ)
   - Next.js本番ビルド
   - アセット最適化
   - ビルドアーティファクトの保存

3. **セキュリティスキャン** (`security-scan`ジョブ)
   - Trivyによる脆弱性スキャン
   - SARIF形式でGitHub Security tabに結果表示

4. **デプロイ** (`deploy-*`ジョブ)
   - **Staging**: `develop`ブランチ → ステージング環境
   - **Production**: `main`ブランチ → 本番環境

#### GitHub Secrets設定

リポジトリの「Settings > Secrets and variables > Actions」で設定：

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sentry
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
```

## 📈 パフォーマンス最適化

### Core Web Vitals目標値

- **LCP**: < 2.5秒
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTFB**: < 800ms

### 最適化施策

1. **画像最適化**
   - WebP/AVIF形式の使用
   - 適切なサイズの設定
   - 遅延読み込み

2. **フォント最適化**
   - `font-display: swap`の使用
   - Google Fontsの最適化

3. **JavaScript最適化**
   - コード分割
   - 動的インポート
   - バンドルサイズの監視

4. **キャッシュ戦略**
   - 静的アセット: 1年キャッシュ
   - API: 60秒キャッシュ
   - CDN活用

## 🔍 監視とアラート

### 監視項目

1. **アプリケーション監視**
   - エラー率 (< 1%)
   - レスポンス時間 (95%ile < 2秒)
   - 可用性 (> 99.9%)

2. **ビジネス監視**
   - 瞑想セッション開始数
   - セッション完了率
   - ユーザー登録数
   - DAU/MAU

3. **インフラ監視**
   - Vercel Function実行時間
   - Supabase接続プール
   - CDNキャッシュヒット率

### アラート設定

#### Sentryアラート

- エラースパイク: 5分で10件以上
- 新しいエラータイプ: 即座に通知
- パフォーマンス劣化: P95が3秒超過

#### Vercel Analytics

- Core Web Vitals劣化
- ビルド失敗
- デプロイ失敗

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー

```bash
# 依存関係の問題
npm ci
npm run build

# 型エラー
npm run lint
npx tsc --noEmit
```

#### 2. Supabase接続エラー

```bash
# 環境変数の確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# RLSポリシーの確認
# Supabaseダッシュボードでポリシーを確認
```

#### 3. パフォーマンス問題

```bash
# バンドル分析
ANALYZE=true npm run build

# Lighthouse監査実行
npx lighthouse https://your-domain.vercel.app --view
```

#### 4. エラー監視

```bash
# Sentryでエラー詳細確認
# - スタックトレース
# - ブレッドクラム
# - ユーザーコンテキスト
# - デバイス情報
```

### ロールバック手順

1. **Vercelでの即座のロールバック**

   ```bash
   vercel rollback [deployment-url]
   ```

2. **GitHubでのロールバック**

   ```bash
   git revert [commit-hash]
   git push origin main
   ```

3. **データベースロールバック**
   - Supabaseダッシュボードでpoint-in-time復旧

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production](https://supabase.com/docs/guides/platform)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals](https://web.dev/vitals/)

---

**注意**: 本番環境への変更は必ずstaging環境での検証後に実施してください。