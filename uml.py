import pydot

# Définition des schémas
schemas = {
    "User": {
        "name": "String",
        "email": "String",
        "password": "String",
        "role": "String",
        "isVerified": "Boolean",
        "langUser": "String",
        "img": "String",
        "imgPublicId": "String",
        "address": "String",
        "phoneNumber": "String",
        "orders": "[Order]",
        "referralCode": "String",
        "referredBy": "User",
        "hasUsedReferral": "Boolean",
        "logHistory": "[Log]",
        "suspended": "Boolean",
        "deliveryPerson": "DeliveryPerson"
    },
    "Article": {
        "name": "String",
        "price": "Number",
        "description": "String",
        "category": "String",
        "restaurantId": "Restaurant",
        "img": "String",
        "imgPublicId": "String"
    },
    "Data": {
        "filename": "String",
        "file": "Buffer"
    },
    "DeliveryPerson": {
        "userId": "User",
        "vehicleDetails": "String",
        "available": "Boolean"
    },
    "Menu": {
        "name": "String",
        "price": "Number",
        "description": "String",
        "articles": "[Article]",
        "restaurantId": "Restaurant"
    },
    "Notification": {
        "userId": "User",
        "message": "String",
        "createdAt": "Date"
    },
    "Order": {
        "orderaddress": "String",
        "orderPhone": "String",
        "userId": "User",
        "DeliveryPersonId": "DeliveryPerson",
        "Orders": "[SubOrderDetails]",
        "OrderPrice": "Number",
        "OriginalOrderPrice": "Number",
        "DiscountApplied": "Boolean",
        "OrderStatus": "String"
    },
    "Payment": {
        "userId": "User",
        "orderId": "Order",
        "amount": "Number",
        "currency": "String",
        "status": "String",
        "createdAt": "Date"
    },
    "Restaurant": {
        "name": "String",
        "address": "String",
        "phone": "String",
        "email": "String",
        "ownerId": "User",
        "articles": "[Article]",
        "menus": "[Menu]",
        "ratings": "[Number]",
        "workingHours": "String",
        "category": "String",
        "img": "String",
        "imgPublicId": "String",
        "subOrders": "[SubOrder]"
    },
    "SubOrder": {
        "restaurantId": "Restaurant",
        "Articles": "[ArticleDetails]",
        "Menus": "[MenuDetails]",
        "OrderPrice": "Number",
        "OrderStatus": "String"
    }
}

# Créer un graphique UML
def create_uml_graph(schemas):
    graph = pydot.Dot(graph_type='digraph')

    for schema_name, fields in schemas.items():
        node = pydot.Node(schema_name, shape='record', label=generate_label(schema_name, fields))
        graph.add_node(node)

        for field_name, field_type in fields.items():
            if field_type in schemas:
                graph.add_edge(pydot.Edge(schema_name, field_type))

    return graph

# Générer une étiquette pour le schéma
def generate_label(schema_name, fields):
    label = f"{schema_name}|"
    label += "|".join([f"{name}: {ftype}" for name, ftype in fields.items()])
    return f"{{ {label} }}"

# Générer et sauvegarder le graphique UML
uml_graph = create_uml_graph(schemas)
uml_graph.write_png('uml_diagram.png')

print("Diagramme UML généré avec succès dans 'uml_diagram.png'.")
