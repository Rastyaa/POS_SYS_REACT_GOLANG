package config

import (
	"log"
)

type SeedProduct struct {
	SKU      string
	Name     string
	Price    float64
	Cost     float64
	Stock    int
	Category string
	Image    string
}

func MigrateAndSeedProducts() {
	// Check if products table exists and count items
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		// If query fails, maybe table is not created yet
		log.Printf("Gagal membaca jumlah produk (mungkin tabel belum dibuat): %v", err)
		return
	}

	// If count is less than 50, let's clear the old products and seed the new fancy menu!
	if count < 50 {
		log.Println("Jumlah produk di bawah 50. Membersihkan database dan melakukan seeding 60 produk Restoran Fancy...")
		
		// Disable constraints / Clear related transactions to prevent foreign key issues
		_, _ = DB.Exec("DELETE FROM sale_items")
		_, _ = DB.Exec("DELETE FROM sales")
		_, err = DB.Exec("DELETE FROM products")
		if err != nil {
			log.Fatalf("Gagal membersihkan tabel produk: %v", err)
		}

		seedData := getFancyMenuData()

		stmt, err := DB.Prepare(`
			INSERT INTO products (sku, name, price, cost, stock, category, image)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`)
		if err != nil {
			log.Fatalf("Gagal menyiapkan statement insert produk: %v", err)
		}
		defer stmt.Close()

		for _, p := range seedData {
			_, err = stmt.Exec(p.SKU, p.Name, p.Price, p.Cost, p.Stock, p.Category, p.Image)
			if err != nil {
				log.Fatalf("Gagal melakukan seeding produk %s: %v", p.Name, err)
			}
		}

		log.Println("SUCCESS: Berhasil seeding 60 produk Restoran Fancy!")
	}
}

func getFancyMenuData() []SeedProduct {
	return []SeedProduct{
		// === MAKANAN UTAMA (20 Items) ===
		// Khas Indonesia (7)
		{
			SKU:      "FOOD-ID-01",
			Name:     "Sop Buntut Premium Madu",
			Price:    95000,
			Cost:     45000,
			Stock:    30,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-ID-02",
			Name:     "Nasi Goreng Wagyu Rendang",
			Price:    75000,
			Cost:     30000,
			Stock:    40,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1616666188851-bc29023db171?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-ID-03",
			Name:     "Rendang Daging Wagyu Minang",
			Price:    120000,
			Cost:     55000,
			Stock:    25,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1601356616077-695728617985?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-ID-04",
			Name:     "Sate Ayam Madura Premium",
			Price:    55000,
			Cost:     22000,
			Stock:    50,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-ID-05",
			Name:     "Bebek Goreng Crispy Ubud",
			Price:    85000,
			Cost:     38000,
			Stock:    30,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-ID-06",
			Name:     "Gado-Gado Siram Senayan",
			Price:    45000,
			Cost:     18000,
			Stock:    35,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-ID-07",
			Name:     "Iga Penyet Bakar Madu",
			Price:    98000,
			Cost:     42000,
			Stock:    20,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
		},
		// Khas Italia (7)
		{
			SKU:      "FOOD-IT-01",
			Name:     "Fettuccine Carbonara Classico",
			Price:    85000,
			Cost:     35000,
			Stock:    35,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-IT-02",
			Name:     "Spaghetti Bolognese Al Dente",
			Price:    75000,
			Cost:     28000,
			Stock:    45,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1516100882582-76c9a14106bc?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-IT-03",
			Name:     "Pizza Margherita Extra Virgin",
			Price:    95000,
			Cost:     32000,
			Stock:    25,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-IT-04",
			Name:     "Lasagna Al Forno Parmigiano",
			Price:    88000,
			Cost:     38000,
			Stock:    20,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-IT-05",
			Name:     "Risotto Ai Funghi Porcini",
			Price:    110000,
			Cost:     45000,
			Stock:    15,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-IT-06",
			Name:     "Penne All'Arrabbiata Spicy",
			Price:    68000,
			Cost:     24000,
			Stock:    40,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-IT-07",
			Name:     "Gnocchi Di Patate Gorgonzola",
			Price:    80000,
			Cost:     30000,
			Stock:    25,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
		},
		// Khas Prancis (6)
		{
			SKU:      "FOOD-FR-01",
			Name:     "Boeuf Bourguignon Tradition",
			Price:    145000,
			Cost:     65000,
			Stock:    15,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-FR-02",
			Name:     "Coq Au Vin Blanc Premium",
			Price:    125000,
			Cost:     55000,
			Stock:    20,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-FR-03",
			Name:     "Ratatouille Niçoise Classique",
			Price:    70000,
			Cost:     28000,
			Stock:    30,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-FR-04",
			Name:     "Soupe A L'oignon Gratinée",
			Price:    55000,
			Cost:     20000,
			Stock:    25,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1547592165-e1d17fed6006?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-FR-05",
			Name:     "Duck Confit Sauce Orange",
			Price:    160000,
			Cost:     75000,
			Stock:    12,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1514944224746-6bba5b09e5c2?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "FOOD-FR-06",
			Name:     "Escargots A La Bourguignonne",
			Price:    85000,
			Cost:     35000,
			Stock:    18,
			Category: "Makanan Utama",
			Image:    "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&auto=format&fit=crop&q=80",
		},

		// === MINUMAN (20 Items) ===
		{
			SKU:      "DRK-NC-01",
			Name:     "Es Teh Manis Jasmine",
			Price:    15000,
			Cost:     3000,
			Stock:    100,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-02",
			Name:     "Lychee Iced Tea Fresh",
			Price:    25000,
			Cost:     8000,
			Stock:    80,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-03",
			Name:     "Peach Mojito Mocktail",
			Price:    32000,
			Cost:     10000,
			Stock:    50,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-04",
			Name:     "Virgin Pina Colada Mocktail",
			Price:    35000,
			Cost:     12000,
			Stock:    40,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-05",
			Name:     "Strawberry Basil Smash",
			Price:    32000,
			Cost:     9000,
			Stock:    45,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-06",
			Name:     "Fresh Avocado Juice",
			Price:    28000,
			Cost:     10000,
			Stock:    40,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-07",
			Name:     "Fresh Mango Smoothie",
			Price:    30000,
			Cost:     11000,
			Stock:    35,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-08",
			Name:     "Iced Lemon Tea Cooler",
			Price:    22000,
			Cost:     6000,
			Stock:    75,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-09",
			Name:     "Blue Ocean Sparkler",
			Price:    34000,
			Cost:     11000,
			Stock:    30,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-10",
			Name:     "Matcha Green Tea Latte Iced",
			Price:    28000,
			Cost:     10000,
			Stock:    60,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-11",
			Name:     "Creamy Taro Latte Iced",
			Price:    28000,
			Cost:     10000,
			Stock:    50,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-12",
			Name:     "Red Velvet Frappe Blend",
			Price:    30000,
			Cost:     12000,
			Stock:    30,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-13",
			Name:     "Hot Chamomile Premium Tea",
			Price:    20000,
			Cost:     5000,
			Stock:    90,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-14",
			Name:     "Hot Earl Grey British Tea",
			Price:    20000,
			Cost:     5000,
			Stock:    90,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-15",
			Name:     "Thai Iced Tea Cha Yen",
			Price:    24000,
			Cost:     7000,
			Stock:    85,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-16",
			Name:     "Lemonade Mint Cooler",
			Price:    26000,
			Cost:     8000,
			Stock:    65,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-17",
			Name:     "Watermelon Mint Slush",
			Price:    25000,
			Cost:     7000,
			Stock:    70,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-18",
			Name:     "Premium Mineral Water 750ml",
			Price:    12000,
			Cost:     3000,
			Stock:    120,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1608885898957-a599fb16ec88?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-19",
			Name:     "Sparkling Water San Pellegrino",
			Price:    38000,
			Cost:     15000,
			Stock:    40,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1608885898957-a599fb16ec88?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-NC-20",
			Name:     "Hot Ginger Honey Herbal Tea",
			Price:    22000,
			Cost:     6000,
			Stock:    50,
			Category: "Minuman",
			Image:    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
		},

		// === KOPI (10 Items) ===
		{
			SKU:      "DRK-CF-01",
			Name:     "Espresso Double Shot",
			Price:    25000,
			Cost:     6000,
			Stock:    200,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1510972527409-cef6e4a4d64e?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-02",
			Name:     "Cappuccino Hot Classico",
			Price:    32000,
			Cost:     9000,
			Stock:    80,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-03",
			Name:     "Flat White Velvet",
			Price:    32000,
			Cost:     9000,
			Stock:    80,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-04",
			Name:     "Cafe Latte Hot Creamy",
			Price:    32000,
			Cost:     9000,
			Stock:    85,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-05",
			Name:     "Iced Caramel Macchiato",
			Price:    38000,
			Cost:     12000,
			Stock:    60,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-06",
			Name:     "Iced Americano Roast",
			Price:    25000,
			Cost:     5000,
			Stock:    150,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1551030173-122adad4009a?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-07",
			Name:     "Hot Piccolo Latte",
			Price:    28000,
			Cost:     8000,
			Stock:    90,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-08",
			Name:     "Affogato Al Caffe Espresso",
			Price:    30000,
			Cost:     10000,
			Stock:    40,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1594911774802-8822a7079af1?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-09",
			Name:     "Iced Hazelnut Latte Smooth",
			Price:    36000,
			Cost:     11000,
			Stock:    70,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DRK-CF-10",
			Name:     "Hot Mochaccino Delight",
			Price:    34000,
			Cost:     10000,
			Stock:    75,
			Category: "Kopi",
			Image:    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
		},

		// === DESSERT (10 Items) ===
		{
			SKU:      "DSR-01",
			Name:     "Tiramisu Classico Italiano",
			Price:    45000,
			Cost:     15000,
			Stock:    25,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-02",
			Name:     "French Crêpes Suzette Orange",
			Price:    50000,
			Cost:     18000,
			Stock:    20,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-03",
			Name:     "Molten Chocolate Lava Cake",
			Price:    48000,
			Cost:     16000,
			Stock:    20,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-04",
			Name:     "Crème Brûlée Vanille Gousse",
			Price:    42000,
			Cost:     14000,
			Stock:    30,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-05",
			Name:     "Red Velvet Premium Cake Slice",
			Price:    45000,
			Cost:     15000,
			Stock:    15,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1616031037011-08bc3e863dbe?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-06",
			Name:     "New York Cheesecake Baked",
			Price:    48000,
			Cost:     17000,
			Stock:    15,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-07",
			Name:     "Apple Tarte Tatin French style",
			Price:    55000,
			Cost:     20000,
			Stock:    12,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1601000919721-933e08bb3ad1?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-08",
			Name:     "Macaron Assortment Parisian (5pcs)",
			Price:    40000,
			Cost:     15000,
			Stock:    35,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-09",
			Name:     "Chocolate Éclair Patisserie",
			Price:    35000,
			Cost:     12000,
			Stock:    25,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1608219990919-a29d1684040f?w=600&auto=format&fit=crop&q=80",
		},
		{
			SKU:      "DSR-10",
			Name:     "Panna Cotta Strawberry Cream",
			Price:    38000,
			Cost:     13000,
			Stock:    20,
			Category: "Dessert",
			Image:    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
		},
	}
}
