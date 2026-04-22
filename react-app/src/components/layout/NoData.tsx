export const NoData = () => {
    return (
        <div className="no-data-wrapper">
            <div className="no-data-icon">📂</div>
            <div className="no-data-title">データが読み込まれていません</div>
            <p className="no-data-desc">
                ヘッダーの「インポート」から既存のプロジェクトを読み込むか、「新規作成」を開始してください。
            </p>
        </div>
    );
};
