import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Offer {
  id: number;
  type: string;
  amount: string;
  rate: string;
  seller: string;
  verified: boolean;
  deals: number;
}

interface OffersSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  offers: Offer[];
}

const OffersSection = ({ activeTab, setActiveTab, offers }: OffersSectionProps) => {
  return (
    <section id="offers" className="py-20 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">Объявления</h3>
          <p className="text-xl text-muted-foreground">Актуальные предложения от проверенных пользователей</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-8">
              <TabsTrigger value="buy" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="TrendingUp" className="mr-2" size={20} />
                Купить USDT
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="TrendingDown" className="mr-2" size={20} />
                Продать USDT
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="space-y-4">
              {offers.filter(o => o.type === 'buy').map((offer) => (
                <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">{offer.seller[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{offer.seller}</p>
                            {offer.verified && (
                              <Badge className="bg-accent/20 text-accent border-accent/30">
                                <Icon name="CheckCircle" size={12} className="mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{offer.deals} успешных сделок</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Сумма</p>
                          <p className="text-xl font-bold">{offer.amount} ₽</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Курс</p>
                          <p className="text-xl font-bold text-secondary">{offer.rate} ₽</p>
                        </div>
                        <Button className="bg-secondary text-primary hover:bg-secondary/90">
                          Связаться
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="sell" className="space-y-4">
              {offers.filter(o => o.type === 'sell').map((offer) => (
                <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">{offer.seller[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{offer.seller}</p>
                            {offer.verified && (
                              <Badge className="bg-accent/20 text-accent border-accent/30">
                                <Icon name="CheckCircle" size={12} className="mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{offer.deals} успешных сделок</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Сумма</p>
                          <p className="text-xl font-bold">{offer.amount} ₽</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Курс</p>
                          <p className="text-xl font-bold text-secondary">{offer.rate} ₽</p>
                        </div>
                        <Button className="bg-secondary text-primary hover:bg-secondary/90">
                          Связаться
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
