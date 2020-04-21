class MyShop{
	//конструктор класу, що визивається за замовчуванням
	constructor(url, type){
		// визиваємо екземпляр класу бібліотеки xml2json.js, що ми підключили
		var x2js = new X2JS({attributePrefix: []});
		var th = this;
		//робимо ajax get запит, щоб прочитати наш products.xml, 
		//значення якого передаємо у вхідному параметрі url
		$.get(url, function(xmlText){
			// викликаємо метод xml2json бібліотеки xml2json.js, який перетворить xml на json
			this.xml = x2js.xml2json(xmlText);
			// перевіріємо type (вхідний параметр), якщо у нього значення category та
			// products.xml не пустий та id категорії, що вказана у вашому xml файлі
			// збігається з тою що у адресній строці, то викликаємо метод printProducts()	
			if(type=='category' && this.xml && this.xml.category.id==th.route()['cat_id']){
				// метод, який виведе товари з вашої категорії до контенту
				th.printProducts(this.xml.category);
			}

			//якщо у нас є товари то перебираємо масив таким чином, щоби у якості ключа кожного елементу став id товару
			var products = {};
			if(this.xml.category.product){
				$.each(this.xml.category.product, function(i,v){
					products[v.id] = v;
				});
			}	
			if(type=='product' && this.xml && this.xml.category.id==th.route()['cat_id'] && products[th.route()['id']]){
				// метод, який виведе лише товар
				th.printProduct(products[th.route()['id']]);
			}	
			if(type=='cart' && $.cookie('products')){
				var cartProds = {};
				var cookieProds = JSON.parse($.cookie('products'));
				if(cookieProds){
					$.each(cookieProds, function(i,v){
						//додаємо кількість
						products[i]['qty'] = v;
					});
					// метод, який виведе товари до корзини
					var cart = {};
					cart['cart'] = products;
					th.printCart(cart);
			}
			}					
			
		});
	}

	printCart(cart){
		//метод з бібліотеки jquery.tmpl.min.js, який передає масив з товарами у ваш шаблон,
		//а сформований код додає до блока #content
		$('#cartTmpl').tmpl(cart).appendTo('#content');
	}	

	printProducts(products){
		//метод з бібліотеки jquery.tmpl.min.js, який передає масив з товарами у ваш шаблон,
		//а сформований код додає до блока #content
		$('#prodTmpl').tmpl(products).appendTo('#content');
	}

	printProduct(product){
		//метод з бібліотеки jquery.tmpl.min.js, який передає масив з товаром у ваш шаблон,
		//а сформований код додає до блока #content
		$('#oneProdTmpl').tmpl(product).appendTo('#content');
	}
	// метод який розбиває адресну строку, що йде після знаку #,
	//на властивості й значення та повертає масив з ними
	route(){
		if(window.location.hash){
			var hash = window.location.hash.replace('#','');
			var returnVar = [];
			hash = hash.split('&');
			$.each(hash, function(index, value){
				value = value.split('=');
				returnVar[value[0]] = value[1];
			});
			return returnVar;
		}
	}
}

$('html').on('click','.buy',function(){
	var id = $(this).data('id');
	var name = $(this).data('name');
	var link = $(this).data('link');
	var count = 0;

	var products = {};
	
	//зчитуємо масив з кукі та декодуємо його з формату json до масиву
	if($.cookie('products')) products = JSON.parse($.cookie('products'));
	if(products[id]){
		products[id] = parseInt(products[id])+1;
		count = products[id];
	}else{
		products[id] = 1;
		count = 1;
	}

	//записуємо масив у кукі у форматі json
	$.cookie('products',JSON.stringify(products));

	alert('Товар '+name+' в количестве '+count+' шт. успешно добавлен в корзину! ');	
	$(this).after('<p><a href="'+link+'">Просмотреть корзину</a></p>');
	return false;
});