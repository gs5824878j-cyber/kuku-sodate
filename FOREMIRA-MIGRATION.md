# FOREMIRA 移行準備

作業ブランチ prepare/foremira。2026-11-01の利用者の切り替え指示に基づき、独立Vercelへ正式配置し、新URLのDNS・HTTPS・公開資産・復元を確認済み。旧GitHub Pagesは記録救出用に維持する。

全体の試験・URL対応・バックアップ・未確認事項と切り替え手順は `/workspace/foremira-migration/README.md` を参照。

## ローカル回帰試験

`python3 -m unittest discover -s tests -v`

Python Playwrightと/usr/bin/chromiumを使う。2つの使い捨てローカルHTTPサーバーと新規ブラウザプロファイルのみを使用し、外部通信は遮断する。ソケットを拒否される実行サンドボックスではサポートされた昇格経路で実行する。

## 旧URLを残す構成への改訂（2026-11-01）

PCの実記録の別origin復元表示は利用者が一致を確認。スマホ・ホーム画面版を含む対応要望により、現リポジトリへCNAMEを追加する旧案は中止し、旧URLをHTTP 200で残す。ユーザーサイト自体の独自ドメインは変更しない。新URLは別の公開先に配置する（利用者が独立Vercelプロジェクト＋GitHubソース管理を選択）。旧URLの301よりも記録救出を優先し、canonicalで新URLを示す。この判断は公開レビューに含める。

旧アプリのリンクは同じ画面内の同origin iframeで保存画面を開き、通常ブラウザへの移動を避ける。旧GitHubホストでは保存専用。旧ホストでは閉じるだけで実行中の状態を保ち、復元可能な新ホストでは記録を読み直す。JS無効時は通常リンクを残す。iOSの実際の保存領域共有・ダウンロード/共有動作は実機確認が必要で、iframe方式だけで全端末の動作を保証しない。

保存画面はGAなし、CSP connect-src none、kuku_preview_v5のみ許可。ダウンロード、対応時のWeb Share(File)、テキスト表示/コピーを用意。テキスト表示・コピーだけでは既存記録の退避完了にせず、利用者の保存確認が必要。共有キャンセルは退避完了にしない。JSONファイル/テキストの復元は同一の型・サイズ検証・既存記録の退避・確認・他タブ更新検査を通す。容量不足/保存拒否はエラーで停止し、既存記録を消さない。

本番切り替え前に、旧アプリ内の保存導線を先行公開し、PC/Android/iPhone Safari/各ホーム画面版で記録あり・なし・保存/共有・再起動・別origin復元を確認する。プライベートモード、消去済み記録、異なる端末の記録が自動で取り出せるとは案内しない。利用者データを運営者へ送らず、各画面で保存する。

## バランス型の再起動互換性（新サイト候補のみ）

公開後の回帰検証で、旧app.jsは保存済みpet.branch=balanceを最初に描画する時点でRO.balanceが未定義のため、初期化が中断することが判明した。旧公開ソースと同じ現象であり、移行データの破損ではない。新サイト候補では同じ定義を最初の描画より前へ移動するだけで修正し、値・育成計算・保存形式を変えない。旧公開app.jsにはまだ反映しない。旧保存画面を閉じるだけではアプリを再起動しない。

## 独立Vercelプロジェクトへの正式配置

正式プロジェクトはkuku-foremira（prj_TyipjUV8egWNhlndkolTPffpGvEi）。2026-11-01、利用者が「ドメイン切り替えて」と指示。旧GitHub PagesへCNAMEを設定せず、旧URLは200で記録救出用に残す。新URLへの全面301は行わない。

vercel.jsonは正式用で、ルートはインデックス可能、保存/復元ページだけnoindex/no-storeと外部通信禁止CSP。Preview専用設定・確認バナーを流用しない。.vercelignoreは公開静的ファイルだけの許可リスト。Vercel認証情報・環境変数・利用者のJSONは配置しない。GA4はG-NBJ7466KDJを維持し、正式HTTPSホストだけ有効。

このブランチの承認されたcommitから許可リストの静的ファイルとvercel.jsonだけを展開し、正式プロジェクトへ手動配置する。CLIの既存認証を利用し、認証情報をチャットに貼らない。VercelのGit自動デプロイは未連携のため、mainへのmergeだけでは正式Vercelへ反映されない。独自ドメイン接続後にそのプロジェクトのDNS推奨値を再取得し、XServerのkukuレコードだけを設定する。既存NS・メール関連・所有確認レコードを維持する。

PC実記録の別origin復元とiPhone Safariでの共有→Files保存は利用者が確認。iPhoneでの復元、実ホーム画面版、Android実機は未確認のまま切り替え指示を受領。合成記録の自動試験と実機合格を区別して報告する。

### 正式配置の記録（DNS追加前）

配置commitは533771b01e4adff7698dd3693e5858433e482d3e、Production deploymentはdpl_AKAej4vfzRJ68TSnyhQoVGiLaMGn（READY）。13静的ファイル＋vercel.jsonの全14 SourceがSHA1一致。kuku.foremira.comはこのdeploymentへ接続済み、所有確認true、redirectなし。DNS/TLS利用可能の確認はまだ完了していない。

実プロジェクトのrecommendedCNAME rank=1は e07dfa23e6c964f6.vercel-dns-017.com.。XServerでホストkuku・CNAME・TTL3600の1件だけ追加する。管理接続がないためこの登録は利用者操作。既存NS・メール関連・所有確認・blog/btsレコードは変更しない。新URL復元入口は https://kuku.foremira.com/migration.html 。旧URLは記録救出用に200で残し、自動転送しない。

本番用設定で合成記録の旧→新origin復元、バランス型の学習起動、ポイント/育成/設定維持、CSP下の画面内保存、canonical/OG、root index可能・migration noindex/no-store、既存GA4の本番1回/Preview無効を確認。DNS前のHTTP Host指定確認は403で利用できず、新ドメインの実HTTPS配信検証はDNS追加後に行う。

## 公開後の最終確認（2026-11-01）

https://kuku.foremira.com/ はHTTPS200。13公開資産が正式配置commit533771bと一致。HTTPから実308でHTTPSへ移り、query/hashを保持。実新ホストで合成記録の旧originからの保存→ファイル検査だけでは書込なし→確認後復元→学習・育成・設定保持と起動を確認。GA4既存IDのconfig1回は実送信を遮断して検証した。

旧 /kuku-sodate/ とユーザーサイトの /foremira-data-migration/kuku/ は保存窓口として残す。旧GitHub PagesへのCNAMEは追加しない。新VercelはGitHubで管理した承認commitから手動配置しており、Git自動配置は未連携。mainは旧保存窓口のため、今回の公開Sourceはprepare/foremira/PR #2で管理する。この追記は文書だけで、公開ファイルの再配置は不要。

公式 https://foremira.com/ も公開・HTTPSを確認済みで5サービスへ新URLでリンクする。テストバトンは利用者の方針により本番化時に移行し、今回は保留。Search Console、GA実受信、実iPhoneの新正式URLへの復元・実ホーム画面版/Androidは未確認。所有者がPCで保存した実JSONの確認サイトへの復元一致と、iPhone SafariのFiles保存報告は、自動試験と分けて記録する。
