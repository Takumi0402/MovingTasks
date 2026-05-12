interface Tab {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
    return (
        <div className="tabs-container">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
