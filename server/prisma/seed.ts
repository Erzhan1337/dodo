import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting');

  // Сначала зависимые таблицы
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productItem.deleteMany();

  // Потом основные
  await prisma.product.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('All data is deleted');

  const cheeseBorder = await prisma.ingredient.create({
    data: {
      name: 'Сырный бортик',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1767535131/%D1%81%D1%8B%D1%80%D0%BD%D1%8B%D0%B9_%D0%B1%D0%BE%D1%80%D1%82%D0%B8%D0%BA_gjsbxj.png',
      price: 850,
    },
  });

  const mozzarella = await prisma.ingredient.create({
    data: {
      name: 'Моцарелла',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954333/%D0%BC%D0%BE%D1%86%D0%B0%D1%80%D0%B5%D0%BB%D0%BB%D0%B0_d0hlal.png',
      price: 450,
    },
  });
  const cheddar_parmesan = await prisma.ingredient.create({
    data: {
      name: 'Чеддер и Пармезан',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954332/%D1%87%D0%B5%D0%B4%D0%B4%D0%B5%D1%80_%D0%BF%D0%B0%D1%80%D0%BC%D0%B5%D0%B7%D0%B0%D0%BD_pxinrc.png',
      price: 450,
    },
  });
  const hot_jalapeno_pepper = await prisma.ingredient.create({
    data: {
      name: 'Острый перец халапеньо',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954332/%D0%BE%D1%81%D1%82%D1%80%D1%8B%D0%B9_%D0%BF%D0%B5%D1%80%D0%B5%D1%86_%D1%85%D0%B0%D0%BB%D0%B0%D0%BF%D0%B5%D0%BD%D1%8C%D0%BE_mesplq.png',
      price: 250,
    },
  });

  const champignons = await prisma.ingredient.create({
    data: {
      name: 'Шампиньоны',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D1%88%D0%B0%D0%BC%D0%BF%D0%B8%D0%BD%D1%8C%D0%BE%D0%BD%D1%8B_gfj1e2.png',
      price: 250,
    },
  });

  const chicken_ham = await prisma.ingredient.create({
    data: {
      name: 'Ветчина из цыпленка',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D0%B2%D0%B5%D1%82%D1%87%D0%B8%D0%BD%D0%B0_%D0%B8%D0%B7_%D1%86%D1%8B%D0%BF%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0_mnia0o.png',
      price: 450,
    },
  });

  const chick = await prisma.ingredient.create({
    data: {
      name: 'Цыпленок',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D1%86%D1%8B%D0%BF%D0%BB%D0%B5%D0%BD%D0%BE%D0%BA_q1rpe0.png',
      price: 450,
    },
  });

  const chicken_pepperoni = await prisma.ingredient.create({
    data: {
      name: 'Пепперони из цыпленка',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D0%BF%D0%B5%D0%BF%D0%BF%D0%B5%D1%80%D0%BE%D0%BD%D0%B8_%D0%B8%D0%B7_%D1%86%D1%8B%D0%BF%D0%BB%D0%B5%D0%BD%D0%BA%D0%B0_kk339c.png',
      price: 450,
    },
  });

  const red_onion = await prisma.ingredient.create({
    data: {
      name: 'Красный лук',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D0%BA%D1%80%D0%B0%D1%81%D0%BD%D1%8B%D0%B9_%D0%BB%D1%83%D0%BA_ibkl7h.png',
      price: 250,
    },
  });

  const pickled_cucumbers = await prisma.ingredient.create({
    data: {
      name: 'Маринованные огурчики',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D0%BC%D0%B0%D1%80%D0%B8%D0%BD%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5_%D0%BE%D0%B3%D1%83%D1%80%D1%87%D0%B8%D0%BA%D0%B8_fhucnh.png',
      price: 250,
    },
  });
  const pineapple = await prisma.ingredient.create({
    data: {
      name: 'Ананасы',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954330/%D0%B0%D0%BD%D0%B0%D0%BD%D0%B0%D1%81%D1%8B_fdivt4.png',
      price: 250,
    },
  });

  const italian_herbs = await prisma.ingredient.create({
    data: {
      name: 'Итальянские травы',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D0%B8%D1%82%D0%B0%D0%BB%D1%8C%D1%8F%D0%BD%D1%81%D0%BA%D0%B8%D0%B5_%D1%82%D1%80%D0%B0%D0%B2%D1%8B_kd4ids.png',
      price: 250,
    },
  });

  const hot_sausages = await prisma.ingredient.create({
    data: {
      name: 'Острые колбаски',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D0%BE%D1%81%D1%82%D1%80%D1%8B%D0%B5_%D0%BA%D0%BE%D0%BB%D0%B1%D0%B0%D1%81%D0%BA%D0%B8_t9ciie.png',
      price: 450,
    },
  });

  const tomatoes = await prisma.ingredient.create({
    data: {
      name: 'Томаты',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954331/%D1%82%D0%BE%D0%BC%D0%B0%D1%82%D1%8B_amjeo3.png',
      price: 250,
    },
  });

  const meatballs = await prisma.ingredient.create({
    data: {
      name: 'Фрикадельки',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1765954330/%D0%BC%D0%B8%D1%82%D0%B1%D0%BE%D0%BB%D1%8B_%D0%B8%D0%B7_%D0%B3%D0%BE%D0%B2%D1%8F%D0%B4%D0%B8%D0%BD%D1%8B_hyxvlw.png',
      price: 450,
    },
  });

  const categoryMeat = await prisma.category.create({
    data: {
      name: 'Мясные',
    },
  });

  const categorySpicy = await prisma.category.create({
    data: {
      name: 'Острые',
    },
  });

  const categorySweet = await prisma.category.create({
    data: {
      name: 'Сладкие',
    },
  });

  const categoryVegetarian = await prisma.category.create({
    data: {
      name: 'Вегетарианские',
    },
  });

  const categoryChicken = await prisma.category.create({
    data: {
      name: 'С курицей',
    },
  });

  const cheesePizza = await prisma.product.create({
    data: {
      name: 'Сырная',
      description: 'Моцарелла, сыры чеддер и пармезан, соус альфредо',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%81%D1%8B%D1%80%D0%BD%D0%B0%D1%8F_fuxdfh.avif',
      ingredients: {
        connect: [{ id: mozzarella.id }, { id: cheddar_parmesan.id }],
      },
      categoryId: categoryVegetarian.id,
      items: {
        create: [
          {
            size: 25,
            price: 2090,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767592436/pizza_syrnaya_25_tra_bf6ozt.png',
          },
          {
            size: 30,
            price: 3050,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767592440/pizza_syrnaya_30_tra_muja6c.png',
          },
          {
            size: 35,
            price: 3950,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767592437/pizza_syrnaya_35_tra_x1fore.png',
          },
          {
            size: 30,
            price: 3250,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767592440/pizza_synaya_30_ton_kewf3s.png',
          },
          {
            size: 35,
            price: 3950,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767592436/pizza_syranaya_35_ton_dit79x.png',
          },
        ],
      },
    },
  });

  const teriyaki = await prisma.product.create({
    data: {
      name: 'Терияки',
      description:
        'Нежный цыпленок, красный лук, зеленый перец, соус терияки, сыр моцарелла и фирменный соус альфредо',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%82%D0%B5%D1%80%D0%B8%D1%8F%D0%BA%D0%B8_mfiuwj.avif',
      ingredients: {
        connect: [
          { id: red_onion.id },
          { id: chick.id },
          { id: mozzarella.id },
          { id: italian_herbs.id },
        ],
      },
      categoryId: categoryChicken.id,
      items: {
        create: [
          {
            size: 25,
            price: 2950,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593116/pizza_teriyaki_25_tra_jsvzm7.png',
          },
          {
            size: 30,
            price: 4150,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593117/pizza_teriyaki_30_tra_p5vtcf.png',
          },
          {
            size: 30,
            price: 4250,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593117/pizza_teriyaki_30_ton_zok7uc.png',
          },
          {
            size: 35,
            price: 4990,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593117/pizza_teriyaki_35_tra_lql6o5.png',
          },
          {
            size: 35,
            price: 5100,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593116/pizza_synaya_35_ton_gffvs6.png',
          },
        ],
      },
    },
  });

  const bomboni = await prisma.product.create({
    data: {
      name: 'Чикен Бомбони',
      description:
        'Наша легендарная пицца. Куриные кусочки, перец, соус сладкий чили, моцарелла, смесь сыров, лук, соус Альфредо',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%87%D0%B8%D0%BA%D0%B5%D0%BD_%D0%B1%D0%BE%D0%BC%D0%B1%D0%BE%D0%BD%D0%B8_uzisyl.avif',
      ingredients: {
        connect: [
          { id: chick.id },
          { id: mozzarella.id },
          { id: cheddar_parmesan.id },
          { id: red_onion.id },
          { id: italian_herbs.id },
        ],
      },
      categoryId: categorySweet.id,
      items: {
        create: [
          {
            size: 25,
            price: 3090,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593484/bomboni_25_tra_oaxpku.png',
          },
          {
            size: 30,
            price: 4750,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593485/bomboni_30_tra_loryia.png',
          },
          {
            size: 30,
            price: 4850,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593485/bomboni_30_ton_fq0d3z.png',
          },
          {
            size: 35,
            price: 5990,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593489/bomboni_35_tra_fg5cza.png',
          },
          {
            size: 35,
            price: 6100,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767593490/bomboni_35_ton_ihrlh8.png',
          },
        ],
      },
    },
  });

  const barbecue = await prisma.product.create({
    data: {
      name: 'Колбаски Барбекю',
      description:
        'Острая чоризо, соус барбекю, томаты, красный лук, моцарелла, томатный соус',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594112/%D0%BA%D0%BE%D0%BB%D0%B1%D0%B0%D1%81%D0%BA%D0%B8_%D0%B1%D0%B0%D1%80%D0%B1%D0%B5%D0%BA%D1%8E_o8so4w.avif',
      ingredients: {
        connect: [
          { id: tomatoes.id },
          { id: hot_sausages.id },
          { id: red_onion.id },
        ],
      },
      categoryId: categorySpicy.id,
      items: {
        create: [
          {
            size: 25,
            price: 2950,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594371/bar_25_tra_mdgkel.png',
          },
          {
            size: 30,
            price: 4150,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594372/bar_30_tra_weemmm.png',
          },
          {
            size: 30,
            price: 4250,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594373/bar_30_ton_swxsf1.png',
          },
          {
            size: 35,
            price: 4990,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594373/bar_35_tra_y6pvcx.png',
          },
          {
            size: 35,
            price: 5100,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594373/bar_35_ton_qivr6a.png',
          },
        ],
      },
    },
  });

  const meat = await prisma.product.create({
    data: {
      name: 'Ветчина и Сыр',
      description:
        'Ветчина из цыпленка, моцарелла и соус альфредо — просто и со вкусом',
      imageUrl:
        'https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D0%B2%D0%B5%D1%82%D1%87%D0%B8%D0%BD%D0%B0_%D0%B8_%D1%81%D1%8B%D1%80_rlq4zq.avif',
      ingredients: {
        connect: [{ id: chicken_ham.id }, { id: mozzarella.id }],
      },
      categoryId: categoryMeat.id,
      items: {
        create: [
          {
            size: 25,
            price: 2250,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594751/meat_25_tra_zwkqaq.png',
          },
          {
            size: 30,
            price: 3650,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594749/meat_30_tra_lvajjg.png',
          },
          {
            size: 30,
            price: 3750,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594749/meat_30_ton_u87xym.png',
          },
          {
            size: 35,
            price: 4250,
            pizzaType: 1,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594750/meat_35_tra_ox5y9g.png',
          },
          {
            size: 35,
            price: 4400,
            pizzaType: 2,
            imageUrl:
              'https://res.cloudinary.com/dgtya5crt/image/upload/v1767594750/meat_35_ton_uhw4mr.png',
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
